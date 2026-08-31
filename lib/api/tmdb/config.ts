// lib/api/tmdb/config.ts
export const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
export const TMDB_FETCH_TIMEOUT_MS = 15_000;

export function isTmdbConfigured(): boolean {
  return Boolean(TMDB_API_KEY);
}

export function tmdbImageUrl(
  path: string | null | undefined,
  size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'original'
): string | undefined {
  if (!path) return undefined;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
