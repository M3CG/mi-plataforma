// lib/api/repositories/movies.ts
import type { Movie } from '@/types';
import type { MovieFilters } from '@/entities/movie/types/filters';
import type { PaginatedResult } from '../pagination/types';
import type { StrapiListResponse } from '../strapi/types';

import {
  DEFAULT_PAGE_SIZE,
  HOME_PAGE_SIZE,
} from '../pagination/config';

import { fetchApi } from '../http/client';
import { getHasMore } from '../strapi/pagination';

import {
  normalizeMovie,
  normalizeMovieList,
} from '../strapi/normalizers';

import { buildMovieListParams } from '../strapi/movieParams';

import {
  buildPopulateParams,
  MOVIE_DETAIL_POPULATE,
} from '../strapi/populate';

import { isValidSlug } from '@/lib/utils/slugify';
import { logger } from '@/lib/utils/logger';

export async function fetchMoviesWithFilters(
  queryParams: MovieFilters = {},
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Movie>> {
  const safePage = Math.max(1, Math.floor(Number(page) || 1));

  const safePageSize = Math.max(
    1,
    Math.floor(Number(pageSize) || DEFAULT_PAGE_SIZE)
  );

  const params = buildMovieListParams(
    queryParams,
    safePage,
    safePageSize
  );

  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/movies',
    params,
    {
      next: {
        revalidate: 60,
        tags: ['movies', 'movies:list'],
      },
    }
  );

  return {
    data: normalizeMovieList(json),
    hasMore: getHasMore(json, safePage, safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}

export async function fetchHomeMovies(): Promise<Movie[]> {
  const params = buildMovieListParams(
    { sort: 'latest' },
    1,
    HOME_PAGE_SIZE
  );

  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/movies',
    params,
    {
      next: {
        revalidate: 3600,
        tags: ['movies', 'movies:home'],
      },
    }
  );

  return normalizeMovieList(json);
}

export async function fetchMovieBySlug(
  slug: string
): Promise<Movie | null> {
  if (!isValidSlug(slug)) {
    logger.warn('Slug de película inválido', {
      component: 'MoviesRepository',
      action: 'fetchMovieBySlug',
      slug,
    });

    return null;
  }

  const params = {
    'filters[slug][$eq]': slug,
    ...buildPopulateParams(MOVIE_DETAIL_POPULATE),
    'pagination[pageSize]': '1',
  };

  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/movies',
    params,
    {
      next: {
        revalidate: 3600,
        tags: ['movies', `movie:${slug}`],
      },
    }
  );

  const firstItem = Array.isArray(json?.data)
    ? json.data[0]
    : undefined;

  if (!firstItem) return null;

  return normalizeMovie(firstItem);
}