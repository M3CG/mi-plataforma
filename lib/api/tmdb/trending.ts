// lib/api/tmdb/trending.ts
import {
  TMDB_API_KEY,
  TMDB_BASE_URL,
  TMDB_FETCH_TIMEOUT_MS,
  isTmdbConfigured,
  tmdbImageUrl,
} from './config';
import type { Movie } from '@/entities/movie';
import { normalizeTmdbResultsToMovies } from './catalogNormalizer';

/**
 * Fetch a TMDB con caché de Next.js (1 hora).
 * Se usa para el home, donde el contenido no cambia rápido.
 */
async function tmdbFetchCached(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<{ results?: Array<Record<string, unknown>> } | null> {
  if (!isTmdbConfigured()) return null;

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TMDB_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      next: { revalidate: 3600, tags: ['tmdb', 'home'] },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return (await res.json()) as { results?: Array<Record<string, unknown>> };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Convierte resultados crudos de TMDB al formato intermedio
 * que espera normalizeTmdbResultsToMovies.
 */
function normalizeRawTmdbResults(
  rawResults: Array<Record<string, unknown>>
): Array<Record<string, unknown>> {
  return rawResults.map((movie) => ({
    tmdbId: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    year: movie.release_date
      ? new Date(String(movie.release_date)).getFullYear()
      : undefined,
    posterUrl: tmdbImageUrl(movie.poster_path as string | null, 'w500'),
    backdropUrl: tmdbImageUrl(movie.backdrop_path as string | null, 'w780'),
    rating: movie.vote_average,
    overview: movie.overview,
    originalLanguage: movie.original_language,
    genreIds: movie.genre_ids ?? [],
  }));
}

/** Películas trending de la semana. */
export async function fetchTrendingMovies(
  limit: number = 20
): Promise<Movie[]> {
  const data = await tmdbFetchCached('/trending/movie/week', { page: '1' });
  const rawResults = (data?.results ?? []).slice(0, limit);
  return normalizeTmdbResultsToMovies(normalizeRawTmdbResults(rawResults));
}

/** Películas mejor puntuadas de todos los tiempos. */
export async function fetchTopRatedMovies(
  limit: number = 20
): Promise<Movie[]> {
  const data = await tmdbFetchCached('/movie/top_rated', { page: '1' });
  const rawResults = (data?.results ?? []).slice(0, limit);
  return normalizeTmdbResultsToMovies(normalizeRawTmdbResults(rawResults));
}

/** Películas en cines ahora. */
export async function fetchNowPlayingMovies(
  limit: number = 20
): Promise<Movie[]> {
  const data = await tmdbFetchCached('/movie/now_playing', { page: '1' });
  const rawResults = (data?.results ?? []).slice(0, limit);
  return normalizeTmdbResultsToMovies(normalizeRawTmdbResults(rawResults));
}

/** Películas populares (equivalente a "más vistas"). */
export async function fetchPopularMovies(
  limit: number = 20
): Promise<Movie[]> {
  const data = await tmdbFetchCached('/movie/popular', { page: '1' });
  const rawResults = (data?.results ?? []).slice(0, limit);
  return normalizeTmdbResultsToMovies(normalizeRawTmdbResults(rawResults));
}