// lib/api/repositories/adminImport.ts
import { API_URL } from '../http/config';
import { cleanApiUrl } from '../http/url';
import { slugify } from '@/lib/utils/slugify';
import type {
  TmdbMoviePreview,
  TmdbPersonPreview,
} from '../tmdb/types';

const STRAPI_ADMIN_TOKEN = process.env.STRAPI_API_TOKEN || '';
const ADMIN_FETCH_TIMEOUT_MS = 20_000;

type StrapiDataList<T> = { data?: T[] };
type StrapiDataOne<T> = { data?: T };

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
  if (STRAPI_ADMIN_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_ADMIN_TOKEN}`;
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
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    clearTimeout(timeout);
    return null;
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

/**
 * Busca una película existente por tmdb_id y devuelve slug + documentId.
 * Útil para saber si una película ya está en la DB antes de mostrar el preview.
 */
export async function findExistingMovieByTmdbId(
  tmdbId: number
): Promise<{ documentId: string; slug: string } | null> {
  const existing = await strapiAdminRequest<
    StrapiDataList<{ documentId: string; slug?: string }>
  >(
    `/movies?filters[tmdb_id][$eq]=${tmdbId}&status=published&pagination[pageSize]=1&fields[0]=documentId&fields[1]=slug`
  );
  if (existing?.data && existing.data.length > 0) {
    const item = existing.data[0];
    return {
      documentId: item.documentId,
      slug: item.slug ?? '',
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
  return created?.data?.documentId ?? null;
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

  const categoryIds: string[] = [];
  for (const genre of preview.genres) {
    const id = await findOrCreateByTmdbId('categories', genre.tmdbId, {
      name: genre.name,
      slug: slugify(genre.name),
      tmdb_id: genre.tmdbId,
    });
    if (id) categoryIds.push(id);
  }

  const actorIds: string[] = [];
  for (const actor of preview.cast) {
    const id = await findOrCreateByTmdbId('actors', actor.tmdbId, {
      name: actor.name,
      slug: slugify(actor.name),
      tmdb_id: actor.tmdbId,
      profile_image_url: actor.profileImageUrl ?? null,
    });
    if (id) actorIds.push(id);
  }

  const directorIds: string[] = [];
  for (const director of preview.directors) {
    const id = await findOrCreateByTmdbId('directors', director.tmdbId, {
      name: director.name,
      slug: slugify(director.name),
      tmdb_id: director.tmdbId,
      profile_image_url: director.profileImageUrl ?? null,
    });
    if (id) directorIds.push(id);
  }

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
