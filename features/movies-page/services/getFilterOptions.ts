import { cache } from 'react';
import type { Category } from '@/entities/category';
import { getCategories } from '@/lib/queries/categories';
import { getCountries } from '@/lib/queries/countries';

export interface FilterOptions {
  categories: Category[];
  countries: string[];
}

/**
 * Opciones de filtros (categorías + países).
 * Cacheado con React.cache: no se re-fetcha cuando cambian los filtros.
 * El TTL largo (1h) ya está configurado en los repositories.
 */
export const getFilterOptions = cache(
  async (): Promise<FilterOptions> => {
    const [categories, countries] = await Promise.all([
      getCategories(),
      getCountries(),
    ]);
    return { categories, countries };
  }
);
