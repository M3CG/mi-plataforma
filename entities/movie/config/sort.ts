// entities/movie/config/sort.ts

import type { MovieSort } from '../types/filters';

/**
 * Valores válidos de sorting.
 * Fuente canónica para validación.
 */
export const MOVIE_SORT_VALUES: readonly MovieSort[] = [
  'latest',
  'oldest',
  'title',
  'title-desc',
  'rating',
  'rating-asc',
];

/**
 * Sorting por defecto.
 */
export const DEFAULT_MOVIE_SORT: MovieSort = 'latest';

/**
 * Type guard para saber si un valor es un sort válido.
 */
export function isMovieSort(value: unknown): value is MovieSort {
  return (
    typeof value === 'string' &&
    (MOVIE_SORT_VALUES as readonly string[]).includes(value)
  );
}

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