import { getHomeMovies } from '@/lib/queries/movies';
import type { Movie } from '@/entities/movie';

export interface HomePageData {
  movies: Movie[];
}

export async function getHomePageData(): Promise<HomePageData> {
  const movies = await getHomeMovies();

  return {
    movies,
  };
}
