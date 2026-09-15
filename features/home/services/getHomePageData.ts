// features/home/services/getHomePageData.ts
import type { HomeHeroData, HomeRankingsData } from '../types';
import {
  fetchTrendingMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchPopularMovies,
} from '@/lib/api/tmdb/trending';

const LATEST_SIZE = 10;
const TOP_VIEWED_SIZE = 10;
const BEST_RATED_SIZE = 10;
const HERO_COUNT = 6;

/**
 * Hero + "Recién llegadas".
 *
 * Ya NO consulta Strapi. Todo viene de TMDB:
 * - Hero: TMDB Trending (las más populares de la semana)
 * - "New Arrivals": TMDB Now Playing (en cines ahora)
 *
 * IMPORTANTE: el home usa caché de 1 hora (next.revalidate en trending.ts).
 */
export async function getHomeHeroData(): Promise<HomeHeroData> {
  const [trending, nowPlaying] = await Promise.all([
    fetchTrendingMovies(HERO_COUNT + LATEST_SIZE),
    fetchNowPlayingMovies(LATEST_SIZE),
  ]);

  // Para la cinta VHS necesitamos backdrops (16:9).
  // Priorizamos las que tienen backdrop; si faltan, rellenamos
  // con las que solo tienen poster.
  const withBackdrop = trending.filter((m) => Boolean(m.backdrop_url));
  const withPosterOnly = trending.filter(
    (m) => !m.backdrop_url && Boolean(m.poster_url)
  );

  return {
    heroMovies: [...withBackdrop, ...withPosterOnly].slice(0, HERO_COUNT),
    latestMovies: nowPlaying.slice(0, LATEST_SIZE),
  };
}

/**
 * Rankings ("más vistas" y "lo mejor").
 * Se streamean después del hero.
 *
 * - "Most Watched": TMDB Popular (por popularidad)
 * - "Best of All Time": TMDB Top Rated
 */
export async function getHomeRankingsData(): Promise<HomeRankingsData> {
  const [popular, topRated] = await Promise.all([
    fetchPopularMovies(TOP_VIEWED_SIZE),
    fetchTopRatedMovies(BEST_RATED_SIZE),
  ]);

  return {
    mostViewedMovies: popular,
    bestOfAllTimeMovies: topRated,
  };
}