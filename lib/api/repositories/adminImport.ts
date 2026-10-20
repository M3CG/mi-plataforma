// lib/api/repositories/adminImport.ts
import { API_URL, STRAPI_API_TOKEN } from '../http/config';
import { cleanApiUrl } from '../http/url';
import { slugify } from '@/lib/utils/slugify';
import { logger } from '@/lib/utils/logger';
import type {
  TmdbMoviePreview,
  TmdbPersonPreview,
} from '../tmdb/types';
import { getMoviePreview } from '../tmdb';
import {
  generateSlugCandidates,
  pickCanonicalBaseTitle,
} from '../tmdb/slugCandidates';

const ADMIN_FETCH_TIMEOUT_MS = 15_000;

type StrapiDataList<T> = { data?: T[] };
type StrapiDataOne<T> = { data?: T };

export class StrapiUnreachableError extends Error {
  readonly endpoint: string;
  readonly originalError: unknown;

  constructor(endpoint: string, originalError: unknown) {
    super(`Strapi is unreachable (network failure on ${endpoint})`);
    this.name = 'StrapiUnreachableError';
    this.endpoint = endpoint;
    this.originalError = originalError;
  }
}

async function strapiAdminRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  body?: unknown
): Promise<T | null> {
  const base = cleanApiUrl(API_URL);
  const url = `${base}/api${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (STRAPI_API_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_API_TOKEN}`;
  }
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    ADMIN_FETCH_TIMEOUT_MS
  );
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      let bodySnippet = '';
      try {
        bodySnippet = (await res.text()).slice(0, 300);
      } catch {
        // ignore
      }
      logger.warn('Strapi rechazó la petición', {
        component: 'repository',
        action: `strapiAdminRequest ${method} ${endpoint}`,
        status: res.status,
        body: bodySnippet,
      });
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    clearTimeout(timeout);
    logger.warn('Strapi request falló (red/timeout)', {
      component: 'repository',
      action: `strapiAdminRequest ${method} ${endpoint}`,
    });
    throw new StrapiUnreachableError(`${method} ${endpoint}`, error);
  }
}

async function findPublishedByTmdbId(
  collection: string,
  tmdbId: number
): Promise<string | null> {
  const existing = await strapiAdminRequest<
    StrapiDataList<{ documentId: string }>
  >(
    `/${collection}?filters[tmdb_id][$eq]=${tmdbId}&status=published&pagination[pageSize]=1`
  );
  if (existing?.data && existing.data.length > 0) {
    return existing.data[0].documentId;
  }
  return null;
}

export async function findExistingMovieByTmdbId(
  tmdbId: number
): Promise<{ documentId: string; slug: string; views: number } | null> {
  const existing = await strapiAdminRequest<
    StrapiDataList<{ documentId: string; slug?: string; views?: number }>
  >(
    `/movies?filters[tmdb_id][$eq]=${tmdbId}&status=published&pagination[pageSize]=1&fields[0]=slug&fields[1]=views`
  );
  if (existing?.data && existing.data.length > 0) {
    const item = existing.data[0];
    return {
      documentId: item.documentId,
      slug: item.slug ?? '',
      views: typeof item.views === 'number' ? item.views : 0,
    };
  }
  return null;
}

async function findOrCreateByTmdbId(
  collection: string,
  tmdbId: number,
  data: Record<string, unknown>
): Promise<string | null> {
  const existingDocumentId = await findPublishedByTmdbId(collection, tmdbId);
  if (existingDocumentId) {
    return existingDocumentId;
  }
  const created = await strapiAdminRequest<
    StrapiDataOne<{ documentId: string }>
  >(`/${collection}`, 'POST', { data });

  if (created?.data?.documentId) {
    return created.data.documentId;
  }

  return findPublishedByTmdbId(collection, tmdbId);
}

export async function checkSlugsTaken(
  collection: 'movies' | 'actors',
  slugs: string[]
): Promise<Set<string>> {
  const taken = new Set<string>();
  if (slugs.length === 0) return taken;
  const filters = slugs
    .map(
      (slug, index) =>
        `filters[slug][$in][${index}]=${encodeURIComponent(slug)}`
    )
    .join('&');
  const res = await strapiAdminRequest<
    StrapiDataList<{ slug?: string }>
  >(
    `/${collection}?${filters}&status=published&pagination[pageSize]=${Math.max(
      slugs.length,
      1
    )}`
  );
  (res?.data ?? []).forEach((item) => {
    if (item.slug) taken.add(item.slug);
  });
  return taken;
}

export async function checkMovieTmdbIds(
  tmdbIds: number[]
): Promise<number[]> {
  if (tmdbIds.length === 0) return [];
  const found: number[] = [];
  const BATCH = 50;
  for (let i = 0; i < tmdbIds.length; i += BATCH) {
    const batch = tmdbIds.slice(i, i + BATCH);
    const filters = batch
      .map((id, idx) => `filters[tmdb_id][$in][${idx}]=${id}`)
      .join('&');
    const res = await strapiAdminRequest<
      StrapiDataList<{ tmdb_id?: number }>
    >(
      `/movies?${filters}&status=published&pagination[pageSize]=${batch.length}&fields[0]=tmdb_id`
    );
    (res?.data ?? []).forEach((item) => {
      if (item.tmdb_id !== undefined && item.tmdb_id !== null) {
        found.push(item.tmdb_id);
      }
    });
  }
  return found;
}

async function findMaxSlugCounter(prefix: string): Promise<number> {
  const res = await strapiAdminRequest<StrapiDataList<{ slug?: string }>>(
    `/movies?filters[slug][$startsWith]=${encodeURIComponent(prefix)}` +
      `&status=published&pagination[pageSize]=100&fields[0]=slug`
  );
  let max = 1;
  for (const item of res?.data ?? []) {
    const slug = item.slug ?? '';
    const suffix = slug.slice(prefix.length);
    const match = suffix.match(/^(\d+)$/);
    if (match) {
      max = Math.max(max, parseInt(match[1], 10));
    }
  }
  return max;
}

export interface ImportMovieSelection {
  slug: string;
  posterUrl?: string;
  backdropUrl?: string;
}

export type ImportResult =
  | { ok: true; documentId: string; slug?: string }
  | { ok: false; error?: string };

export async function importMovie(
  preview: TmdbMoviePreview,
  selection: ImportMovieSelection
): Promise<ImportResult> {
  const existing = await findPublishedByTmdbId('movies', preview.tmdbId);
  if (existing) {
    return {
      ok: false,
      error: 'This movie already exists in the database.',
    };
  }

  const [categoryIdsAll, actorIdsAll, directorIdsAll] = await Promise.all([
    Promise.all(
      preview.genres.map((genre) =>
        findOrCreateByTmdbId('categories', genre.tmdbId, {
          name: genre.name,
          slug: slugify(genre.name),
          tmdb_id: genre.tmdbId,
        })
      )
    ),
    Promise.all(
      preview.cast.map((actor) =>
        findOrCreateByTmdbId('actors', actor.tmdbId, {
          name: actor.name,
          slug: slugify(actor.name) || `person-${actor.tmdbId}`,
          tmdb_id: actor.tmdbId,
          profile_image_url: actor.profileImageUrl ?? null,
        })
      )
    ),
    Promise.all(
      preview.directors.map((director) =>
        findOrCreateByTmdbId('directors', director.tmdbId, {
          name: director.name,
          slug: slugify(director.name) || `person-${director.tmdbId}`,
          tmdb_id: director.tmdbId,
          profile_image_url: director.profileImageUrl ?? null,
        })
      )
    ),
  ]);

  const categoryIds = categoryIdsAll.filter(
    (id): id is string => Boolean(id)
  );
  const actorIds = actorIdsAll.filter((id): id is string => Boolean(id));
  const directorIds = directorIdsAll.filter(
    (id): id is string => Boolean(id)
  );

  const movieData = {
    title: preview.originalTitle,
    english_title: preview.englishTitle ?? null,
    spanish_title: preview.spanishTitle ?? null,
    slug: selection.slug,
    synopsis: preview.mainSynopsis || 'No synopsis available.',
    english_synopsis: preview.englishSynopsis ?? null,
    spanish_synopsis: preview.spanishSynopsis ?? null,
    tmdb_id: preview.tmdbId,
    imdb_id: preview.imdbId ?? null,
    country: preview.country ?? '',
    year: preview.year,
    rating: preview.rating,
    runtime: preview.runtime ?? 0,
    age_rating: preview.ageRating ?? null,
    original_language: preview.originalLanguage ?? 'en',
    poster_url: selection.posterUrl ?? null,
    backdrop_url: selection.backdropUrl ?? null,
    trailer_url: preview.trailerUrl ?? null,
    is_featured: false,
    views: 0,
    categories: categoryIds,
    actors: actorIds,
    directors: directorIds,
  };

  const created = await strapiAdminRequest<
    StrapiDataOne<{ documentId: string; slug?: string }>
  >('/movies', 'POST', { data: movieData });

  if (created?.data) {
    return {
      ok: true,
      documentId: created.data.documentId,
      slug: created.data.slug,
    };
  }
  return { ok: false, error: 'Could not create the movie in Strapi.' };
}

export async function importActor(
  preview: TmdbPersonPreview,
  selection: { slug: string; profileImageUrl?: string }
): Promise<ImportResult> {
  const documentId = await findOrCreateByTmdbId(
    'actors',
    preview.tmdbId,
    {
      name: preview.name,
      slug: selection.slug,
      tmdb_id: preview.tmdbId,
      profile_image_url: selection.profileImageUrl ?? null,
    }
  );
  if (documentId) return { ok: true, documentId };
  return { ok: false, error: 'Could not create the actor in Strapi.' };
}

export interface MaterializedMovie {
  documentId: string;
  slug: string;
  views: number;
}

export async function selectCanonicalSlug(
  preview: TmdbMoviePreview
): Promise<string | null> {
  const year = preview.year > 0 ? preview.year : null;

  const candidates = generateSlugCandidates({
    originalTitle: preview.originalTitle,
    englishTitle: preview.englishTitle,
    spanishTitle: preview.spanishTitle,
    year: preview.year || undefined,
    tmdbId: preview.tmdbId,
  });

  const chain = candidates
    .filter((c) => c.source === 'canonical')
    .map((c) => c.slug);

  if (chain.length === 0) return null;

  const baseTitle = pickCanonicalBaseTitle([
    preview.originalTitle,
    preview.englishTitle,
    preview.spanishTitle,
  ]);
  const base = baseTitle ? slugify(baseTitle) : null;

  const safetyNet = base ? `${base}-${preview.tmdbId}` : null;
  const toCheck = safetyNet ? [...chain, safetyNet] : [...chain];

  const taken = await checkSlugsTaken('movies', toCheck);

  const free = chain.find((slug) => !taken.has(slug));
  if (free) return free;

  if (base && year) {
    const max = await findMaxSlugCounter(`${base}-${year}-`);
    return `${base}-${year}-${max + 1}`;
  }

  if (safetyNet && !taken.has(safetyNet)) return safetyNet;
  return null;
}

export async function materializeMovieFromTmdb(
  tmdbId: number
): Promise<MaterializedMovie | null> {
  const existing = await findExistingMovieByTmdbId(tmdbId);
  if (existing?.slug) return existing;

  const preview = await getMoviePreview(tmdbId);
  if (!preview) return null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = await selectCanonicalSlug(preview);
    if (!slug) return null;

    const result = await importMovie(preview, {
      slug,
      posterUrl: preview.defaultPosterUrl,
      backdropUrl: preview.defaultBackdropUrl,
    });

    if (result.ok) {
      logger.info('Película materializada en Strapi', {
        component: 'repository',
        action: 'materializeMovieFromTmdb',
        tmdbId,
        slug: result.slug ?? slug,
        documentId: result.documentId,
      });
      return {
        documentId: result.documentId,
        slug: result.slug ?? slug,
        views: 0,
      };
    }

    const winner = await findExistingMovieByTmdbId(tmdbId);
    if (winner?.slug) return winner;
  }

  logger.warn('No se pudo materializar la película tras 3 intentos', {
    component: 'repository',
    action: 'materializeMovieFromTmdb',
    tmdbId,
  });
  return null;
}

export async function incrementMovieView(
  slug: string,
  documentId?: string,
  currentViews: number = 0
): Promise<boolean> {
  const base = cleanApiUrl(API_URL);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${base}/api/movies/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_API_TOKEN
          ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ slug }),
      signal: controller.signal,
    });

    if (res.ok) {
      return true;
    }

    if (documentId) {
      const updated = await strapiAdminRequest(
        `/movies/${documentId}`,
        'PUT',
        { data: { views: currentViews + 1 } }
      );
      if (updated) return true;
    }

    logger.warn('Strapi rechazó el incremento de views', {
      component: 'repository',
      action: 'incrementMovieView',
      slug,
      status: res.status,
    });
    return false;
  } catch (error) {
    logger.warn('incrementMovieView no disponible', {
      component: 'repository',
      action: 'incrementMovieView',
      slug,
      error,
    });
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
