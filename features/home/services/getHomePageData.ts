// features/home/services/getHomePageData.ts
import { getMoviesWithFilters } from '@/lib/queries/movies';
import { getCategories } from '@/lib/queries/categories';
import type { Movie } from '@/entities/movie';
import type { HomePageData } from '../types';

const HOME_ROW_SIZE = 20;
const GENRE_ROW_SIZE = 10;
const MAX_GENRE_ROWS = 6;

/**
 * Elige la película del hero: la mejor puntuada que tenga backdrop.
 * Si ninguna tiene backdrop, usa la mejor puntuada igualmente.
 */
function pickHeroMovie(movies: Movie[]): Movie | null {
  const withBackdrop = movies.find((movie) => Boolean(movie.backdrop_url));
  return withBackdrop ?? movies[0] ?? null;
}

export async function getHomePageData(): Promise<HomePageData> {
  const [latest, mostViewed, bestOfAllTime, categories] = await Promise.all([
    getMoviesWithFilters({ sort: 'latest' }, 1, HOME_ROW_SIZE),
    getMoviesWithFilters({ sort: 'views' }, 1, HOME_ROW_SIZE),
    getMoviesWithFilters({ sort: 'rating' }, 1, HOME_ROW_SIZE),
    getCategories(),
  ]);

  const genreCategories = categories.slice(0, MAX_GENRE_ROWS);

  const genreResults = await Promise.all(
    genreCategories.map(async (category) => {
      const result = await getMoviesWithFilters(
        { genres: [category.slug], sort: 'rating' },
        1,
        GENRE_ROW_SIZE
      );
      return { category, movies: result.data };
    })
  );

  const genreRows = genreResults.filter((row) => row.movies.length > 0);

  return {
    heroMovie: pickHeroMovie(bestOfAllTime.data),
    latestMovies: latest.data,
    mostViewedMovies: mostViewed.data,
    bestOfAllTimeMovies: bestOfAllTime.data,
    genreRows,
  };
}
