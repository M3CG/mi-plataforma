import type { Movie, MovieFilters } from '@/entities/movie';
import type { PaginatedResult } from '@/lib/api/pagination/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination/config';
import { serializeMovieFiltersToSearchParams } from '@/lib/url/movieFilters';
import { MOVIE_PAGINATION_PARAM_KEYS } from '@/lib/url/movieFilterParams';
import { PaginatedMoviesSchema } from '@/lib/validation/moviePayloadSchemas';
import { logger } from '@/lib/utils/logger';

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

    const json = await response.json();
    const parsed = PaginatedMoviesSchema.safeParse(json);

    if (!parsed.success) {
      logger.error('Invalid BFF payload for catalog movies', {
        component: 'CatalogClient',
        action: 'fetchMoviesFromApi',
        error: parsed.error,
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

    return parsed.data as PaginatedResult<Movie>;
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
