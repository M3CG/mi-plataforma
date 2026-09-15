// features/movies-page/services/getFilterOptions.ts
import { cache } from 'react';
import type { Category } from '@/entities/category';
import { getTmdbCategories, getTmdbCountries } from '@/lib/api/tmdb/genres';

export interface FilterOptions {
  categories: Category[];
  countries: string[];
}

/**
 * Opciones de filtros (categorías + países).
 *
 * Ya NO consulta Strapi. Los géneros de TMDB son fijos y universales.
 * Los países son una lista curada que mapea a códigos ISO.
 *
 * cache() de React: no se re-fetcha cuando cambian los filtros.
 * Al ser datos hardcodeados, el costo es cero.
 */
export const getFilterOptions = cache(
  async (): Promise<FilterOptions> => {
    return {
      categories: getTmdbCategories(),
      countries: getTmdbCountries(),
    };
  }
);