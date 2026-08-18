// features/catalog/infrastructure/moviesClient.ts
import type { Movie } from '@/types';
import type { MovieFilters } from '@/entities/movie/types/filters';
import type { PaginatedResult } from '@/lib/api/pagination/types';

import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination/config';
import { serializeMovieFiltersToSearchParams } from '@/lib/url/movieFilters';

import {
  MOVIE_PAGINATION_PARAM_KEYS,
} from '@/entities/movie/config/filterParams';

import { logger } from '@/lib/utils/logger';

/**
 * Cliente HTTP exclusivo del catálogo.
 *
 * Responsabilidad:
 * - comunicar el infinite scroll con el BFF
 * - serializar filtros de dominio a query params
 */
export async function fetchMoviesFromApi(
  filters: MovieFilters,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Movie>> {
  try {
    const params = serializeMovieFiltersToSearchParams(filters);

    params.set(MOVIE_PAGINATION_PARAM_KEYS.page, String(page));
    params.set(MOVIE_PAGINATION_PARAM_KEYS.pageSize, String(pageSize));

    const response = await fetch(`/api/movies?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Error fetching movies from BFF', {
      component: 'CatalogClient',
      action: 'fetchMoviesFromApi',
      error,
      page,
      pageSize,
    });

    return {
      data: [],
      hasMore: false,
      page,
      pageSize,
    };
  }
}