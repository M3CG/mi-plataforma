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
  { value: 'latest', label: 'Recientes' },
  { value: 'oldest', label: 'Antiguas' },
  { value: 'title', label: 'A - Z' },
  { value: 'title-desc', label: 'Z - A' },
  { value: 'rating', label: 'Mejor Puntuadas' },
  { value: 'rating-asc', label: 'Peor Puntuadas' },
];
