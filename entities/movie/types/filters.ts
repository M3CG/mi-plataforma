// entities/movie/types/filters.ts

/**
 * Valores canónicos de ordenamiento para películas.
 *
 * Esta es la fuente de verdad para:
 * - UI de filtros
 * - serialización URL
 * - presets de consulta
 */
export type MovieSort =
  | 'latest'
  | 'oldest'
  | 'title'
  | 'title-desc'
  | 'rating'
  | 'rating-asc';

/**
 * Modelo de dominio de filtros de películas.
 *
 * IMPORTANTE:
 * En la Etapa 2A todavía no reemplazamos el MovieFilters viejo de lib/api.
 * Este tipo es el modelo objetivo que vamos a adoptar en la Etapa 2B.
 */
export interface MovieFilters {
  genres?: string[];
  minRating?: number;
  fromYear?: number;
  toYear?: number;
  country?: string;
  sort?: MovieSort;
}

/**
 * Representación cruda de query params, compatible con searchParams.
 *
 * Útil para la capa URL/BFF antes de parsear a dominio.
 */
export type MovieFiltersQuery = Record<
  string,
  string | string[] | undefined
>;