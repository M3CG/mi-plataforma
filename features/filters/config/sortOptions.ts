import type { MovieSort } from '@/entities/movie';

/**
* Opciones visibles de sorting.
*
* La UI debe consumir esto en lugar de definir sus propios valores.
*/
export interface MovieSortOption {
  value: MovieSort;
  label: string;
}

export const MOVIE_SORT_OPTIONS: readonly MovieSortOption[] = [
  { value: 'latest', label: 'Recent' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'A - Z' },
  { value: 'title-desc', label: 'Z - A' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'rating-asc', label: 'Lowest Rated' },
];
