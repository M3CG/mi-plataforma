// lib/api/tmdb/slugCandidates.ts
import { slugify, isLatinizable } from '@/lib/utils/slugify';

export interface SlugCandidateInput {
  originalTitle?: string | null;
  englishTitle?: string | null;
  spanishTitle?: string | null;
  year?: number | null;
  tmdbId?: number | null;
}

export interface BaseSlugCandidate {
  slug: string;
  source: string;
}

const PURE_DIGITS = /^\d+$/;

/**
 * Slug compuesto solo por dígitos ("1917", "2046").
 * Peligroso como slug de DB: es indistinguible de un slug de URL de
 * TMDB (isTmdbSlug() → true). La forma desnuda nunca es canónica.
 */
export function isPureNumericSlug(slug: string): boolean {
  return PURE_DIGITS.test(slug);
}

// lib/api/tmdb/slugCandidates.ts

/**
 * Un título es usable como base de slug si produce ≥1 carácter.
 * Umbral propio (isLatinizable exige ≥2, lo que excluiría títulos
 * reales de un solo carácter como "M" o "9"). No se toca
 * isLatinizable porque otros flujos dependen de su umbral.
 */
function hasSlugValue(title: string | null | undefined): title is string {
  if (!title) return false;
  return slugify(title).length >= 1;
}

export function pickCanonicalBaseTitle(
  titles: Array<string | null | undefined>
): string | null {
  for (const title of titles) {
    if (hasSlugValue(title)) return title;
  }
  return null;
}

/**
 * Genera candidatos de slug.
 *
 * Cadena CANÓNICA (source: 'canonical'), usada por el import
 * automático y por el "Recomendado" de admin:
 *
 *   nombre → nombre-año → nombre-año-2 → nombre-año-3
 *   → (contador real vía query de prefijo)
 *   → "movie-{tmdbId}" (red final)
 *
 * - Si el título original no es latino, la base es el inglés.
 * - Títulos puramente numéricos: la forma desnuda se excluye; la
 *   cadena empieza en la variante con año.
 * - Las variantes de idioma solo existen para elección MANUAL en
 *   la UI de admin import.
 */
export function generateSlugCandidates(
  input: SlugCandidateInput
): BaseSlugCandidate[] {
  const seen = new Set<string>();
  const candidates: BaseSlugCandidate[] = [];
  const push = (slug: string, source: string) => {
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    candidates.push({ slug, source });
  };

  const year = input.year || null;

  // ─── Cadena canónica ───
  const baseTitle = pickCanonicalBaseTitle([
    input.originalTitle,
    input.englishTitle,
    input.spanishTitle,
  ]);

  if (baseTitle) {
    const base = slugify(baseTitle);
    if (!isPureNumericSlug(base)) {
      push(base, 'canonical');
    }
    if (year) {
      push(`${base}-${year}`, 'canonical');
      push(`${base}-${year}-2`, 'canonical');
      push(`${base}-${year}-3`, 'canonical');
    }
  }

  // ─── Red final determinista ───
  // Se alcanza si: no hay ningún título latinizable, o el título es
  // puramente numérico sin año (cadena vacía). El prefijo "movie-" es
  // clave: NO empieza con dígitos, así que isTmdbSlug() jamás lo
  // confunde con un slug de URL de TMDB. Colisión imposible salvo una
  // película titulada literalmente "Movie {id}".
  const canonicalEmpty = candidates.every((c) => c.source !== 'canonical');
  if (canonicalEmpty && input.tmdbId) {
    push(`movie-${input.tmdbId}`, 'canonical');
  }

  // ─── Variantes de idioma (solo elección manual en admin) ───
  for (const { title, source } of [
    { title: input.originalTitle, source: 'original' },
    { title: input.englishTitle, source: 'english' },
    { title: input.spanishTitle, source: 'spanish' },
  ]) {
    if (!title || !isLatinizable(title)) continue;
    const slug = slugify(title);
    push(slug, source);
    if (year) push(`${slug}-${year}`, source);
  }

  return candidates;
}

/**
 * Candidatos de slug para personas (actores/directores).
 */
export function generatePersonSlugCandidates(
  name: string
): BaseSlugCandidate[] {
  const base = slugify(name);
  if (!base) return [];
  const candidates: BaseSlugCandidate[] = [
    { slug: base, source: 'name' },
  ];
  for (let index = 2; index <= 3; index += 1) {
    candidates.push({ slug: `${base}-${index}`, source: 'index' });
  }
  return candidates;
}