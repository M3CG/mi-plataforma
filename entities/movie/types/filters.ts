// entities/movie/types/filters.ts
/**
 * Valores canónicos de ordenamiento para películas.
 */
export type MovieSort =
  | 'latest'
  | 'oldest'
  | 'title'
  | 'title-desc'
  | 'rating'
  | 'rating-asc'
  | 'views';

/**
 * Modelo de dominio de filtros de películas.
 */
export interface MovieFilters {
  genres?: string[];
  minRating?: number;
  fromYear?: number;
  toYear?: number;
  fromRuntime?: number;
  toRuntime?: number;
  country?: string;
  sort?: MovieSort;
}

/**
 * Representación cruda de query params, compatible con searchParams.
 */
export type MovieFiltersQuery = Record<
  string,
  string | string[] | undefined
>;
