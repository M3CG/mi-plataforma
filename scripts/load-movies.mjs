#!/usr/bin/env node
// ============================================================
// Cargador interactivo de películas: TMDB → Strapi
//
//   node scripts/load-movies.mjs                      (menú interactivo)
//   node scripts/load-movies.mjs --tmdb 550 27205
//   node scripts/load-movies.mjs --actor "Morgan Freeman"
//
//   --dry-run        muestra todo pero NO escribe nada
//   --draft          crea las entradas como borrador
//   --max-actors N   top de actores a incluir (default 15)
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── .env (no pisa variables ya definidas) ──
for (const file of ['.env.loader', '.env.local']) {
  try {
    for (const line of fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!(m[1] in process.env)) process.env[m[1]] = v;
    }
  } catch {}
}

const STRAPI_URL = (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337').replace(/\/+$/, '');
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const TMDB_TOKEN = process.env.TMDB_TOKEN || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

// ── Argumentos ──
const OPTS = { tmdbIds: [], actor: null, dryRun: false, draft: false, maxActors: 15 };
{
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--tmdb') { while (/^\d+$/.test(args[i + 1] ?? '')) OPTS.tmdbIds.push(Number(args[++i])); }
    else if (a === '--actor') OPTS.actor = args[++i] ?? null;
    else if (a === '--dry-run') OPTS.dryRun = true;
    else if (a === '--draft') OPTS.draft = true;
    else if (a === '--max-actors') OPTS.maxActors = Number(args[++i]) || 15;
    else if (['-h', '--help'].includes(a)) { console.log('Uso: node scripts/load-movies.mjs [--tmdb id...] [--actor "Nombre"] [--dry-run] [--draft] [--max-actors N]'); process.exit(0); }
  }
}
const publishStatus = () => (OPTS.draft ? 'draft' : 'published');

// ── Consola ──
const paint = (c) => (s) => process.stdout.isTTY ? `\x1b[${c}m${s}\x1b[0m` : String(s);
const green = paint(32), yellow = paint(33), red = paint(31), cyan = paint(36), bold = paint(1), dim = paint(2);
const rl = readline.createInterface({ input: stdin, output: stdout });
const hr = (t) => console.log('\n' + cyan(`── ${t} ${'─'.repeat(Math.max(2, 50 - t.length))}`));
const f = (label, value) => {
  const empty = value === undefined || value === null || value === '';
  console.log(`  ${label.padEnd(20)} ${empty ? dim('—') : value}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function askYesNo(q, def = true) {
  const a = (await rl.question(`${q} ${def ? '[S/n]' : '[s/N]'} `)).trim().toLowerCase();
  if (!a) return def;
  return ['s', 'si', 'sí', 'y', 'yes'].includes(a);
}

function parseSelection(input, max) {
  const nums = new Set();
  for (const part of input.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)) {
    if (['todos', 'all', 't', 'a'].includes(part)) { for (let i = 1; i <= max; i++) nums.add(i); continue; }
    const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) { for (let i = Number(range[1]); i <= Math.min(Number(range[2]), max); i++) nums.add(i); continue; }
    const n = Number(part);
    if (Number.isInteger(n) && n >= 1 && n <= max) nums.add(n);
  }
  return nums;
}

// ── Transliteración opcional (sin ella: acentos degradados, no-latinos caen a inglés) ──
let anyAscii = null;
try { anyAscii = (await import('any-ascii')).default; } catch {}

// ── HTTP ──
async function tmdbGet(endpoint) {
  const res = await fetch(`${TMDB_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} en ${endpoint}`);
  return res.json();
}

async function strapiFetch(method, pathname, { body, params = {} } = {}) {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
  const res = await fetch(`${STRAPI_URL}${pathname}${qs ? '?' + qs : ''}`, {
    method,
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Strapi ${method} ${pathname} → ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`);
  return res.status === 204 ? null : res.json();
}

// Crea con status; si el content-type no soporta draft&publish (400), reintenta sin status
async function strapiCreate(contentType, data, status) {
  try {
    return await strapiFetch('POST', `/api/${contentType}`, { params: { status }, body: { data } });
  } catch (e) {
    if (/→ 400/.test(e.message)) return await strapiFetch('POST', `/api/${contentType}`, { body: { data } });
    throw e;
  }
}

// Busca en publicados Y borradores (deduplica por documentId)
async function findByField(contentType, field, value) {
  const seen = new Map();
  for (const status of ['published', 'draft']) {
    const json = await strapiFetch('GET', `/api/${contentType}`, {
      params: { status, [`filters[${field}][$eq]`]: String(value), 'pagination[pageSize]': '5' },
    }).catch(() => null);
    for (const e of json?.data ?? []) seen.set(e.documentId, e);
  }
  return [...seen.values()];
}

const slugTaken = async (ct, slug, used) =>
  used.has(slug) || (await findByField(ct, 'slug', slug)).length > 0;

// ── Slugs ──
function slugify(text) {
  let s = String(text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (anyAscii) { try { s = anyAscii(s); } catch {} }
  s = s.toLowerCase()
    .replace(/['’´`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
    .replace(/-+$/g, '');
  return s || null;
}

async function buildSlugCandidates({ originalTitle, englishTitle, year }, contentType, used) {
  const list = [];
  const add = async (raw, origen) => {
    const slug = raw ? slugify(raw) : null;
    if (slug && !list.some((c) => c.slug === slug)) {
      list.push({ slug, origen, ocupado: await slugTaken(contentType, slug, used) });
    }
  };
  await add(originalTitle, 'idioma original');
  await add(englishTitle, 'inglés');
  await add(`${englishTitle ?? originalTitle} ${year}`, englishTitle ? 'inglés + año' : 'título + año');
  return list;
}

async function indexedSlug(base, contentType, used) {
  for (let i = 2; i <= 99; i++) {
    const s = `${base}-${i}`;
    if (!(await slugTaken(contentType, s, used))) return { slug: s, origen: `índice (${i})`, ocupado: false };
  }
  return null;
}

async function selectSlug(contentType, info, used) {
  const candidates = await buildSlugCandidates(info, contentType, used);
  if (!candidates.length) { console.log(red('  ✗ No se pudo generar ningún slug desde los títulos.')); return null; }

  let sugerido = candidates.find((c) => !c.ocupado)
    ?? await indexedSlug(candidates[candidates.length - 1].slug, contentType, used);
  if (!sugerido) { console.log(red('  ✗ Sin slugs disponibles.')); return null; }

  hr('SLUG');
  const shown = [...candidates];
  if (sugerido.origen.startsWith('índice')) shown.push(sugerido);
  shown.forEach((c, i) => {
    const estado = c.ocupado ? red('OCUPADO') : green('libre');
    console.log(`  ${i + 1}. ${bold(c.slug).padEnd(48)} ${dim('(' + c.origen + ')')}  ${estado}`);
  });
  console.log(dim(`  Sugerido: ${sugerido.slug}`));

  while (true) {
    const ans = (await rl.question(`  ${dim('[Enter]=sugerido | nº | e=manual | s=saltar película:')} `)).trim().toLowerCase();
    if (ans === '') { used.add(sugerido.slug); return sugerido; }
    if (ans === 's') return null;
    if (ans === 'e') {
      const norm = slugify((await rl.question('  Slug manual: ')).trim());
      if (!norm) { console.log(yellow('  Slug inválido tras normalizar.')); continue; }
      if (await slugTaken(contentType, norm, used)) { console.log(yellow(`  "${norm}" ya está ocupado.`)); continue; }
      used.add(norm);
      return { slug: norm, origen: 'manual', ocupado: false };
    }
    const n = Number(ans);
    if (Number.isInteger(n) && shown[n - 1] && !shown[n - 1].ocupado) {
      used.add(shown[n - 1].slug);
      return shown[n - 1];
    }
  }
}

async function uniqueSlugFor(base, fallback, contentType, used) {
  const baseSlug = slugify(base) ?? fallback;
  let slug = baseSlug, i = 1;
  while (await slugTaken(contentType, slug, used)) slug = `${baseSlug}-${++i}`;
  used.add(slug);
  return slug;
}

// ── TMDB: mapeo y validación ──
let genreNamesEs = null;
async function getGenreNamesEs() {
  if (!genreNamesEs) {
    try { genreNamesEs = new Map((await tmdbGet('/genre/movie/list?language=es-ES')).genres.map((g) => [g.id, g.name])); }
    catch { genreNamesEs = new Map(); }
  }
  return genreNamesEs;
}

function localeValue(translations, codes, prop) {
  for (const code of codes) {
    const v = translations.find((t) => `${t.iso_639_1}-${t.iso_3166_1}` === code)?.data?.[prop];
    if (v?.trim()) return v;
  }
  return undefined;
}

function pickCertification(m) {
  const byIso = new Map((m.release_dates?.results ?? []).map((r) => [r.iso_3166_1, r.release_dates]));
  for (const iso of [...new Set(['US', m.production_countries?.[0]?.iso_3166_1, 'GB', 'FR', 'DE', 'ES'].filter(Boolean))]) {
    const cert = (byIso.get(iso) ?? []).map((d) => d.certification).find(Boolean);
    if (cert) return cert;
  }
  return null;
}

function pickTrailer(m) {
  const vids = (m.videos?.results ?? []).filter((v) => v.site === 'YouTube' && v.type === 'Trailer');
  const pick = vids.find((v) => v.official && v.iso_639_1 === 'en') || vids.find((v) => v.official) || vids[0];
  return pick ? `https://www.youtube.com/watch?v=${pick.key}` : null;
}

async function mapMovie(m) {
  const translations = m.translations?.translations ?? [];
  const origLang = m.original_language ?? '';
  const isEn = origLang === 'en';

  let synopsis, synopsisFallback = false;
  for (const t of translations) {
    if (t.iso_639_1 === origLang && t.data?.overview?.trim()) { synopsis = t.data.overview; break; }
  }
  if (!synopsis && m.overview?.trim()) { synopsis = m.overview; synopsisFallback = !isEn; }

  const genresEs = await getGenreNamesEs();
  const person = (p) => ({ tmdbId: p.id, name: p.name.trim(), profileUrl: p.profile_path ? `${IMG}/w185${p.profile_path}` : undefined });

  return {
    tmdbId: m.id,
    title: (m.original_title ?? m.title ?? '').trim(),
    englishTitle: isEn ? undefined : (localeValue(translations, ['en-US', 'en-GB'], 'title') ?? m.title),
    spanishTitle: localeValue(translations, ['es-ES', 'es-MX'], 'title'),
    synopsis, synopsisFallback,
    englishSynopsis: isEn ? undefined : (localeValue(translations, ['en-US', 'en-GB'], 'overview') ?? m.overview),
    spanishSynopsis: localeValue(translations, ['es-ES', 'es-MX'], 'overview'),
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    rating: typeof m.vote_average === 'number' ? m.vote_average : null,
    country: m.production_countries?.[0]?.name ?? null,
    runtime: m.runtime || null,
    ageRating: pickCertification(m),
    originalLanguage: origLang,
    posterUrl: m.poster_path ? `${IMG}/w780${m.poster_path}` : null,
    backdropUrl: m.backdrop_path ? `${IMG}/w1280${m.backdrop_path}` : null,
    trailerUrl: pickTrailer(m),
    categories: (m.genres ?? []).filter((g) => g.id && g.name).map((g) => ({ tmdbId: g.id, name: genresEs.get(g.id) ?? g.name })),
    cast: [...new Map((m.credits?.cast ?? []).filter((p) => p.id && p.name?.trim()).slice(0, OPTS.maxActors).map((p) => [p.id, person(p)])).values()],
    directors: [...new Map((m.credits?.crew ?? []).filter((p) => p.job === 'Director' && p.id && p.name?.trim()).map((p) => [p.id, person(p)])).values()],
  };
}

function validateMovie(m) {
  const errors = [], warnings = [];
  const req = (cond, msg) => { if (!cond) errors.push(msg); };
  req(m.title, 'title (título original) vacío');
  req(m.synopsis?.trim(), 'sinopsis vacía');
  req(m.year, 'año no disponible');
  req(m.rating !== null, 'rating no disponible');
  req(m.country, 'país no disponible');
  req(m.categories.length > 0, 'sin categorías/géneros');

  if (m.synopsisFallback) warnings.push('sinopsis original no disponible → se usará la inglesa');
  if (!m.runtime) warnings.push('runtime no disponible');
  if (!m.posterUrl) warnings.push('poster no disponible');
  if (!m.backdropUrl) warnings.push('backdrop no disponible');
  if (!m.trailerUrl) warnings.push('trailer no disponible');
  if (!m.ageRating) warnings.push('clasificación por edad no disponible');
  if (!m.directors.length) warnings.push('sin directores');
  if (!m.cast.length) warnings.push('sin actores');
  if (m.originalLanguage !== 'en' && !m.englishTitle) warnings.push('título en inglés no disponible');
  if (!m.spanishTitle) warnings.push('título en español no disponible');
  if (!m.spanishSynopsis) warnings.push('sinopsis en español no disponible');
  return { errors, warnings };
}

// ── Plan de relaciones (sin escribir) ──
async function planPerson(contentType, person, used) {
  const existing = await findByField(contentType, 'tmdb_id', person.tmdbId);
  if (existing.length) return { ...person, status: 'exists', documentId: existing[0].documentId, existingSlug: existing[0].slug };
  const fallback = `${contentType === 'actors' ? 'actor' : 'director'}-${person.tmdbId}`;
  return { ...person, status: 'new', proposedSlug: await uniqueSlugFor(person.name, fallback, contentType, used) };
}

async function planCategory(cat, used) {
  let existing = await findByField('categories', 'tmdb_id', cat.tmdbId);
  if (!existing.length) existing = await findByField('categories', 'name', cat.name);
  if (existing.length) return { ...cat, status: 'exists', documentId: existing[0].documentId, existingSlug: existing[0].slug };
  return { ...cat, status: 'new', proposedSlug: await uniqueSlugFor(cat.name, `categoria-${cat.tmdbId}`, 'categories', used) };
}

// ── Escritura ──
async function ensureRelation(contentType, plan) {
  if (plan.status === 'exists' || OPTS.dryRun) return plan;
  const data = contentType === 'categories'
    ? { name: plan.name, slug: plan.proposedSlug, tmdb_id: plan.tmdbId }
    : { name: plan.name, slug: plan.proposedSlug, tmdb_id: plan.tmdbId, profile_image_url: plan.profileUrl ?? null };
  const json = await strapiCreate(contentType, data, publishStatus());
  return { ...plan, documentId: json.data.documentId };
}

async function createMovie(m, slug, plans) {
  if (OPTS.dryRun) return { documentId: '(dry-run)' };
  const json = await strapiCreate('movies', {
    title: m.title,
    english_title: m.englishTitle ?? null,
    spanish_title: m.spanishTitle ?? null,
    slug,
    synopsis: m.synopsis,
    english_synopsis: m.englishSynopsis ?? null,
    spanish_synopsis: m.spanishSynopsis ?? null,
    year: m.year, rating: m.rating, country: m.country, tmdb_id: m.tmdbId,
    runtime: m.runtime ?? null, age_rating: m.ageRating ?? null,
    original_language: m.originalLanguage,
    poster_url: m.posterUrl ?? null, backdrop_url: m.backdropUrl ?? null, trailer_url: m.trailerUrl ?? null,
    views: 0, featured_this_week: false,
    categories: plans.categories.map((c) => c.documentId),
    actors: plans.cast.map((a) => a.documentId),
    directors: plans.directors.map((d) => d.documentId),
  }, publishStatus());
  return json.data;
}

// ── Selección de películas ──
async function selectActorMovies(actorName) {
  const search = await tmdbGet(`/search/person?query=${encodeURIComponent(actorName)}&include_adult=false&language=es-ES`);
  const people = (search.results ?? []).slice(0, 5);
  if (!people.length) { console.log(red(`Sin resultados para "${actorName}".`)); return []; }

  hr('PERSONAS ENCONTRADAS');
  people.forEach((p, i) => console.log(`  ${i + 1}. ${bold(p.name)} ${dim((p.known_for ?? []).map((k) => k.title || k.name).slice(0, 2).join(', '))}`));
  let person = people[0];
  const pick = (await rl.question(`  Elegir persona ${dim('[Enter]=1 | nº:')} `)).trim();
  if (pick && people[Number(pick) - 1]) person = people[Number(pick) - 1];

  const credits = await tmdbGet(`/person/${person.id}/movie_credits?language=es-ES`);
  const movies = (credits.cast ?? [])
    .filter((c) => c.id && c.title && c.release_date)
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, 40);
  if (!movies.length) { console.log(red('La persona no tiene películas con fecha de estreno.')); return []; }

  hr(`FILMOGRAFÍA DE ${person.name.toUpperCase()}`);
  movies.forEach((m, i) => console.log(`  ${(i + 1).toString().padStart(2)}. ${dim(m.release_date.slice(0, 4))}  ${m.title}`));
  const sel = (await rl.question(`  Cargar cuáles? ${dim('(ej: 1,4-6 | todos | s=salir):')} `)).trim().toLowerCase();
  if (sel === 's') return [];
  const nums = parseSelection(sel, movies.length);
  if (!nums.size) { console.log(yellow('Nada seleccionado.')); return []; }
  return [...nums].sort((a, b) => a - b).map((i) => movies[i - 1].id);
}

async function pickMovies() {
  if (OPTS.tmdbIds.length) return OPTS.tmdbIds;
  if (OPTS.actor) return selectActorMovies(OPTS.actor);
  while (true) {
    const mode = (await rl.question(`\n¿Cómo querés cargar? ${dim('1=TMDB IDs | 2=por actor | q=salir:')} `)).trim().toLowerCase();
    if (mode === 'q') return [];
    if (mode === '1') {
      const ids = (await rl.question('  IDs (coma o espacio): '))
        .split(/[\s,]+/).map(Number).filter((n) => Number.isInteger(n) && n > 0);
      if (ids.length) return ids;
      console.log(yellow('  No leí ningún ID válido.'));
    }
    if (mode === '2') {
      const name = (await rl.question('  Nombre de la persona: ')).trim();
      if (name) { const ids = await selectActorMovies(name); if (ids.length) return ids; }
    }
  }
}

// ── Procesar una película ──
async function processMovie(tmdbId, ctx, results) {
  console.log(`\n${bold('═'.repeat(60))}\n${bold(`PELÍCULA TMDB ${tmdbId}`)}\n${bold('═'.repeat(60))}`);

  const dup = await findByField('movies', 'tmdb_id', tmdbId);
  if (dup.length) {
    console.log(yellow(`  Ya existe en la base: slug="${dup[0].slug}" (doc ${dup[0].documentId}).`));
    if (!(await askYesNo('  ¿Crear igual otra entrada (duplicado intencional)?', false))) {
      console.log(dim('  → Saltada.'));
      return 'skipped';
    }
  }

  const m = await mapMovie(await tmdbGet(`/movie/${tmdbId}?language=en-US&append_to_response=credits,translations,videos,release_dates`));

  // 1) Validación de completitud
  const { errors, warnings } = validateMovie(m);
  if (errors.length) {
    hr('VALIDACIÓN — FALTAN DATOS OBLIGATORIOS');
    errors.forEach((e) => console.log(`  ${red('✗')} ${e}`));
    console.log(red('\n  No se carga: información incompleta. Completala en TMDB/Strapi a mano.'));
    results.push({ title: m.title || `TMDB ${tmdbId}`, state: 'fallida (incompleta)' });
    return 'failed';
  }
  if (warnings.length) {
    hr('ADVERTENCIAS (datos opcionales)');
    warnings.forEach((w) => console.log(`  ${yellow('⚠')} ${w}`));
    if (!(await askYesNo('  ¿Continuar a pesar de las advertencias?', false))) {
      console.log(dim('  → Saltada.'));
      return 'skipped';
    }
  }

  // 2) Plan de relaciones
  const plans = { categories: [], cast: [...m.cast], directors: [...m.directors] };
  for (const g of m.categories) plans.categories.push(await planCategory(g, ctx.used.categories));
  for (const a of plans.cast) Object.assign(a, await planPerson('actors', a, ctx.used.actors));
  for (const d of plans.directors) Object.assign(d, await planPerson('directors', d, ctx.used.directors));

  // 3) Exclusión de actores
  if (plans.cast.length > 1) {
    hr('CAST (podés excluir)');
    plans.cast.forEach((a, i) => console.log(`  ${(i + 1).toString().padStart(2)}. ${a.name}`));
    const excl = parseSelection((await rl.question(`  Excluir cuáles? ${dim('[Enter]=ninguno | ej: 3,5-7:')} `)), plans.cast.length);
    if (excl.size) plans.cast = plans.cast.filter((_, i) => !excl.has(i + 1));
  }

  // 4) Slug
  const slugPick = await selectSlug('movies',
    { originalTitle: m.title, englishTitle: m.englishTitle, year: m.year }, ctx.used.movies);
  if (!slugPick) { console.log(dim('  → Saltada.')); return 'skipped'; }

  // 5) Preview final
  hr('PELÍCULA — A CARGAR');
  f('title', m.title);
  f('english_title', m.englishTitle);
  f('spanish_title', m.spanishTitle);
  f('slug', `${slugPick.slug} ${dim('(' + slugPick.origen + ')')}`);
  f('synopsis', m.synopsis ? m.synopsis.slice(0, 100) + (m.synopsis.length > 100 ? '…' : '') : null);
  f('english_synopsis', m.englishSynopsis ? '✔' : null);
  f('spanish_synopsis', m.spanishSynopsis ? '✔' : null);
  f('year / rating', `${m.year} / ${m.rating}`);
  f('country', m.country);
  f('runtime', m.runtime ? `${m.runtime} min` : null);
  f('age_rating', m.ageRating);
  f('original_language', m.originalLanguage);
  f('tmdb_id', m.tmdbId);
  f('poster_url', m.posterUrl ? '✔' : null);
  f('backdrop_url', m.backdropUrl ? '✔' : null);
  f('trailer_url', m.trailerUrl ? '✔' : null);
  f('views / featured', '0 / false');

  const printRel = (title, items) => {
    hr(`${title} (${items.length})`);
    items.forEach((it, i) => {
      const tag = it.status === 'exists'
        ? green(`[existe · ${it.existingSlug}]`)
        : yellow(`[nuevo · slug: ${it.proposedSlug}]`);
      console.log(`  ${(i + 1).toString().padStart(2)}. ${it.name.padEnd(30)} ${tag}`);
    });
  };
  printRel('CATEGORÍAS', plans.categories);
  printRel('ACTORES', plans.cast);
  printRel('DIRECTORES', plans.directors);

  const nuevos = (arr) => arr.filter((x) => x.status === 'new').length;

  if (OPTS.dryRun) {
    console.log(`\n  ${cyan('DRY-RUN')} — no se escribe nada. Se crearían: ${nuevos(plans.categories)} categorías, ${nuevos(plans.cast)} actores, ${nuevos(plans.directors)} directores y la película.`);
    return 'dry';
  }

  if (!(await askYesNo(`\n  ¿Confirmar carga? (${nuevos(plans.categories)} cat. nuevas, ${nuevos(plans.cast)} actores nuevos, ${nuevos(plans.directors)} directores nuevos + película como ${publishStatus()})`, false))) {
    console.log(dim('  → Cancelada.'));
    return 'skipped';
  }

  // 6) Escritura
  try {
    plans.categories = await Promise.all(plans.categories.map((p) => ensureRelation('categories', p)));
    plans.cast = await Promise.all(plans.cast.map((p) => ensureRelation('actors', p)));
    plans.directors = await Promise.all(plans.directors.map((p) => ensureRelation('directors', p)));
    const created = await createMovie(m, slugPick.slug, plans);
    console.log(green(`\n  ✔ Creada "${m.title}" — slug: ${slugPick.slug} — doc: ${created.documentId} (${publishStatus()})`));
    results.push({ title: m.title, slug: slugPick.slug, doc: created.documentId, state: publishStatus() });
    return 'created';
  } catch (e) {
    console.log(red(`\n  ✗ Error escribiendo en Strapi:\n  ${e.message}`));
    results.push({ title: m.title, state: 'fallida (error Strapi)' });
    return 'failed';
  }
}

// ── Main ──
async function main() {
  console.log(bold('\n🎬 Cargador TMDB → Strapi'));
  console.log(dim(`   Strapi: ${STRAPI_URL} | modo: ${OPTS.dryRun ? 'DRY-RUN' : publishStatus()}${anyAscii ? ' | transliteración: on' : ' | transliteración: off'}\n`));

  if (!TMDB_TOKEN) { console.log(red('Falta TMDB_TOKEN en .env.loader')); process.exit(1); }
  if (!STRAPI_TOKEN) { console.log(red('Falta STRAPI_TOKEN en .env.loader')); process.exit(1); }

  try { await tmdbGet('/configuration'); }
  catch (e) { console.log(red(`TMDB inaccesible: ${e.message}`)); process.exit(1); }

  try { await strapiFetch('GET', '/api/movies', { params: { 'pagination[pageSize]': '1' } }); }
  catch (e) {
    console.log(red(`Strapi inaccesible (${STRAPI_URL}): ${e.message.split('\n')[0]}`));
    console.log(yellow('Verificá STRAPI_TOKEN y sus permisos (find/create en movies, actors, directors, categories).'));
    process.exit(1);
  }

  const ctx = { used: { movies: new Set(), actors: new Set(), directors: new Set(), categories: new Set() } };
  const tally = { created: 0, skipped: 0, failed: 0, dry: 0 };
  const results = [];
  const interactive = !OPTS.tmdbIds.length && !OPTS.actor;

  let ids = await pickMovies();
  while (ids.length) {
    for (const id of ids) {
      const r = await processMovie(id, ctx, results);
      tally[r]++;
      await sleep(300); // pacing TMDB
    }
    if (!interactive || !(await askYesNo('\n¿Cargar más películas?'))) break;
    ids = await pickMovies();
  }

  hr('RESUMEN');
  console.log(`  creadas: ${tally.created} | saltadas: ${tally.skipped} | fallidas: ${tally.failed}${tally.dry ? ` | dry-run: ${tally.dry}` : ''}`);
  for (const r of results) {
    console.log(`   ${r.state.startsWith('fallida') ? red('✗') : green('✔')} ${r.title} ${r.slug ? dim(`→ ${r.slug}`) : ''} ${r.state}`);
  }
}

try { await main(); } catch (e) { console.error(red(`\nError fatal: ${e.message}`)); process.exitCode = 1; } finally { rl.close(); }