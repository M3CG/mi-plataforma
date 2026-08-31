import type { Movie } from '@/entities/movie';

export interface HomePageData {
  heroMovie: Movie | null;
  latestMovies: Movie[];
  mostViewedMovies: Movie[];
}
