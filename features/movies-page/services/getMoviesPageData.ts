// features/movies-page/services/getMoviesPageData.ts
import { getMoviesWithFilters } from '@/lib/queries/movies';
import { getCategories } from '@/lib/queries/categories';
import { getCountries } from '@/lib/queries/countries';

import type { MovieFilters } from '@/entities/movie/types/filters';
import type { MoviesPageData } from '../types';

export async function getMoviesPageData(
  filters: MovieFilters
): Promise<MoviesPageData> {
  const [initialData, categories, countries] = await Promise.all([
    getMoviesWithFilters(filters, 1),
    getCategories(),
    getCountries(),
  ]);

  return {
    filters,
    categories,
    countries,
    initialMovies: initialData.data,
    initialHasMore: initialData.hasMore,
    hasResults: initialData.data.length > 0,
  };
}