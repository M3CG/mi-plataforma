// features/movies-page/types.ts

import type { Category } from '@/entities/category';
import type { Movie } from '@/entities/movie';
import type { MovieFilters } from '@/entities/movie/types/filters';

export interface MoviesPageData {
  filters: MovieFilters;
  categories: Category[];
  countries: string[];
  initialMovies: Movie[];
  initialHasMore: boolean;
  hasResults: boolean;
}