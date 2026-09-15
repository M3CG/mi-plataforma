// lib/api/tmdb/catalogNormalizer.ts
import type { Movie } from '@/entities/movie';
import type { Category } from '@/entities/category';
import { generateTmdbSlug } from './slugResolver';
import { tmdbImageUrl } from './config';

/**
 * Mapa de genre_id → Category.
 */
const TMDB_GENRE_ID_TO_CATEGORY: Record<number, Category> = {
  28:    { id: 28,    name: 'Action',          slug: 'action' },
  12:    { id: 12,    name: 'Adventure',       slug: 'adventure' },
  16:    { id: 16,    name: 'Animation',       slug: 'animation' },
  35:    { id: 35,    name: 'Comedy',          slug: 'comedy' },
  80:    { id: 80,    name: 'Crime',           slug: 'crime' },
  99:    { id: 99,    name: 'Documentary',     slug: 'documentary' },
  18:    { id: 18,    name: 'Drama',           slug: 'drama' },
  10751: { id: 10751, name: 'Family',          slug: 'family' },
  14:    { id: 14,    name: 'Fantasy',         slug: 'fantasy' },
  36:    { id: 36,    name: 'History',         slug: 'history' },
  27:    { id: 27,    name: 'Horror',          slug: 'horror' },
  10402: { id: 10402, name: 'Music',           slug: 'music' },
  9648:  { id: 9648,  name: 'Mystery',         slug: 'mystery' },
  10749: { id: 10749, name: 'Romance',         slug: 'romance' },
  878:   { id: 878,   name: 'Science Fiction', slug: 'science-fiction' },
  10770: { id: 10770, name: 'TV Movie',        slug: 'tv-movie' },
  53:    { id: 53,    name: 'Thriller',        slug: 'thriller' },
  10752: { id: 10752, name: 'War',             slug: 'war' },
  37:    { id: 37,    name: 'Western',         slug: 'western' },
};

/**
 * Convierte un resultado de TMDB Discover a la entidad Movie.
 */
export function normalizeTmdbMovieToEntity(
  raw: Record<string, unknown>
): Movie {
  const tmdbId = (raw.tmdbId as number) ?? 0;
  const title = (raw.title as string) || '';
  const year = (raw.year as number) || 0;
  const overview = (raw.overview as string) || '';
  const rating = (raw.rating as number) || 0;
  const originalLanguage = (raw.originalLanguage as string) || '';

  const genreIds = (raw.genreIds as number[]) || [];
  const categories: Category[] = genreIds
    .map((id) => TMDB_GENRE_ID_TO_CATEGORY[id])
    .filter(Boolean);

  const posterUrl = raw.posterUrl as string | undefined;
  const backdropUrl = raw.backdropUrl as string | undefined;

  return {
    id: tmdbId,
    documentId: `tmdb-${tmdbId}`,
    title,
    slug: generateTmdbSlug(tmdbId, title),
    synopsis: overview,
    year,
    rating,
    country: '',
    tmdb_id: tmdbId,
    poster_url: posterUrl,
    backdrop_url: backdropUrl,
    original_language: originalLanguage || undefined,
    categories,
    servers: [],
    actors: [],
    directors: [],
  };
}

/**
 * Convierte un array de resultados de TMDB Discover a Movie[].
 */
export function normalizeTmdbResultsToMovies(
  results: Array<Record<string, unknown>>
): Movie[] {
  return results.map(normalizeTmdbMovieToEntity);
}

/**
 * Convierte resultados de TMDB Search a Movie[].
 * TMDB Search devuelve menos campos que Discover.
 */
export function normalizeTmdbSearchToMovies(
  results: Array<{
    id: number;
    title: string;
    original_title?: string;
    overview?: string;
    release_date?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
    original_language?: string;
    genre_ids?: number[];
  }>
): Movie[] {
  const normalized = results.map((movie) => ({
    tmdbId: movie.id,
    title: movie.title || movie.original_title || '',
    originalTitle: movie.original_title,
    year: movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : undefined,
    posterUrl: tmdbImageUrl(movie.poster_path, 'w500'),
    backdropUrl: tmdbImageUrl(movie.backdrop_path, 'w780'),
    rating: movie.vote_average ?? 0,
    overview: movie.overview ?? '',
    originalLanguage: movie.original_language ?? '',
    genreIds: movie.genre_ids ?? [],
  }));

  return normalizeTmdbResultsToMovies(normalized);
}