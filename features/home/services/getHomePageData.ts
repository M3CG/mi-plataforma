import {
  getHomeMovies,
  getMoviesWithFilters,
} from '@/lib/queries/movies';
import type { HomeHeroData, HomeRankingsData } from '../types';

const LATEST_SIZE = 10;
const TOP_VIEWED_SIZE = 10;
const BEST_RATED_SIZE = 10;
const HERO_COUNT = 6;

/**
 * Hero + "Recién llegadas".
 *
 * IMPORTANTE: el home usa createdAt (últimas agregadas a la base).
 * El resto del sitio usa year/rating/id (ver movieParams.ts).
 */
export async function getHomeHeroData(): Promise<HomeHeroData> {
  const latestMovies = await getHomeMovies();
  // Para la cinta VHS necesitamos backdrops (16:9).
  // Priorizamos las que tienen backdrop; si faltan, rellenamos
  // con las que solo tienen poster.
  const withBackdrop = latestMovies.filter((m) => Boolean(m.backdrop_url));
  const withPosterOnly = latestMovies.filter(
    (m) => !m.backdrop_url && Boolean(m.poster_url)
  );
  return {
    heroMovies: [...withBackdrop, ...withPosterOnly].slice(0, HERO_COUNT),
    latestMovies: latestMovies.slice(0, LATEST_SIZE),
  };
}

/** Rankings ("más vistas" y "lo mejor"). Se streamean después del hero. */
export async function getHomeRankingsData(): Promise<HomeRankingsData> {
  const [mostViewed, bestRated] = await Promise.all([
    getMoviesWithFilters({ sort: 'views' }, 1, TOP_VIEWED_SIZE),
    getMoviesWithFilters({ sort: 'rating' }, 1, BEST_RATED_SIZE),
  ]);
  return {
    mostViewedMovies: mostViewed.data,
    bestOfAllTimeMovies: bestRated.data,
  };
}
