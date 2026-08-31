// lib/api/tmdb/client.ts
import {
  TMDB_API_KEY,
  TMDB_BASE_URL,
  TMDB_FETCH_TIMEOUT_MS,
  isTmdbConfigured,
} from './config';
import type {
  TmdbMovieDetail,
  TmdbPersonDetail,
  TmdbPersonMovieCredits,
  TmdbSearchMovieItem,
  TmdbSearchPersonItem,
} from './types';

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  if (!isTmdbConfigured()) return null;
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    TMDB_FETCH_TIMEOUT_MS
  );
  try {
    const res = await fetch(url.toString(), {
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

export async function tmdbSearchMovies(
  query: string
): Promise<{ results?: TmdbSearchMovieItem[] } | null> {
  return tmdbFetch('/search/movie', { query, language: 'en-US' });
}

export async function tmdbSearchPersons(
  query: string
): Promise<{ results?: TmdbSearchPersonItem[] } | null> {
  return tmdbFetch('/search/person', { query, language: 'en-US' });
}

export async function tmdbGetMovie(
  id: number
): Promise<TmdbMovieDetail | null> {
  return tmdbFetch(`/movie/${id}`, {
    language: 'en-US',
    append_to_response:
      'translations,credits,videos,release_dates,images',
  });
}

export async function tmdbGetPerson(
  id: number
): Promise<TmdbPersonDetail | null> {
  return tmdbFetch(`/person/${id}`, {
    language: 'en-US',
    append_to_response: 'images',
  });
}

export async function tmdbGetPersonMovieCredits(
  personId: number
): Promise<TmdbPersonMovieCredits | null> {
  return tmdbFetch(`/person/${personId}/movie_credits`, {
    language: 'en-US',
  });
}
