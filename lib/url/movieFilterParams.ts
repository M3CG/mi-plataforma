/**
 * Fuente canónica de los query params de filtros de películas.
 *
 * Esto evita tener strings hardcodeados como:
 * - 'genres'
 * - 'minRating'
 * - 'fromYear'
 * - 'toYear'
 * - 'fromRuntime'
 * - 'toRuntime'
 * - 'country'
 * - 'sort'
 *
 * en múltiples capas.
 */
export const MOVIE_FILTER_PARAM_KEYS = {
  genres: 'genres',
  minRating: 'minRating',
  fromYear: 'fromYear',
  toYear: 'toYear',
  fromRuntime: 'fromRuntime',
  toRuntime: 'toRuntime',
  country: 'country',
  sort: 'sort',
} as const;

export type MovieFilterParamKey =
  (typeof MOVIE_FILTER_PARAM_KEYS)[keyof typeof MOVIE_FILTER_PARAM_KEYS];

/**
 * Query params de paginación usados por el BFF y clientes de catálogo.
 */
export const MOVIE_PAGINATION_PARAM_KEYS = {
  page: 'page',
  pageSize: 'pageSize',
} as const;
