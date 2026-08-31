import { cache } from 'react';
import type { MovieFilters } from '@/entities/movie/types/filters';
import { getMoviesWithFilters } from '@/lib/queries/movies';

export interface FilteredMoviesResult {
  movies: import('@/entities/movie').Movie[];
  hasMore: boolean;
}

/**
 * Fetch cacheado de películas filtradas (primera página).
 *
 * Cada combinación de filtros produce una clave distinta en la
 * cache de React, así que al cambiar los filtros se dispara un
 * nuevo fetch automáticamente.
 */
export const getFilteredMovies = cache(
  async (filters: MovieFilters): Promise<FilteredMoviesResult> => {
    const result = await getMoviesWithFilters(filters, 1);
    return { movies: result.data, hasMore: result.hasMore };
  }
);
