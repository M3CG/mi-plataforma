import { getMoviesWithFilters } from '@/lib/queries/movies';
import type { Movie } from '@/entities/movie';
import type { HomePageData } from '../types';

const LATEST_SIZE = 10;
const TOP_VIEWED_SIZE = 10;
const HERO_CANDIDATES_SIZE = 5;

/**
 * Elige la película del hero: la mejor puntuada que tenga backdrop.
 */
function pickHeroMovie(movies: Movie[]): Movie | null {
  return movies.find((movie) => Boolean(movie.backdrop_url)) ?? movies[0] ?? null;
}

/**
 * Home como cartelera curada:
 * - hero (mejor puntuada)
 * - top 10 más vistas (lista numerada)
 * - 10 recién llegadas (fila minimalista)
 *
 * Solo 3 llamadas a Strapi (antes eran ~10 con las filas de género).
 */
export async function getHomePageData(): Promise<HomePageData> {
  const [latest, mostViewed, bestRated] = await Promise.all([
    getMoviesWithFilters({ sort: 'latest' }, 1, LATEST_SIZE),
    getMoviesWithFilters({ sort: 'views' }, 1, TOP_VIEWED_SIZE),
    getMoviesWithFilters({ sort: 'rating' }, 1, HERO_CANDIDATES_SIZE),
  ]);

  return {
    heroMovie: pickHeroMovie(bestRated.data),
    latestMovies: latest.data,
    mostViewedMovies: mostViewed.data,
  };
}
