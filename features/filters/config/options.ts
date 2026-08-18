// features/filters/config/options.ts

import {
  MOVIE_SORT_OPTIONS,
  MOVIE_YEAR_MIN,
  getMovieYearMax,
  type MovieSort,
} from '@/entities/movie';

export const YEAR_MIN = MOVIE_YEAR_MIN;
export const YEAR_MAX = getMovieYearMax();

export const RATING_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: '5', label: '5.0+' },
  { value: '6', label: '6.0+' },
  { value: '7', label: '7.0+' },
  { value: '8', label: '8.0+' },
  { value: '9', label: '9.0+' },
] as const;

/**
 * Las opciones de sorting salen de la entidad movie.
 */
export const SORT_OPTIONS = MOVIE_SORT_OPTIONS;

export type RatingOptionValue =
  (typeof RATING_OPTIONS)[number]['value'];

export type SortOptionValue = MovieSort;