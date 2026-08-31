// lib/api/repositories/movies.ts
import {
  type Movie,
  type MovieFilters,
  shouldUseGenreMatchRanking,
} from '@/entities/movie';
import {
  GENRE_RANKED_PARAM_KEYS,
  GENRE_RANKED_PAGINATION_KEYS,
} from '../strapi/genreRankedParams';
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

/**
 * El home no muestra servidores ni idiomas: pedimos menos
 * relaciones para achicar el payload RSC/HTML.
 */
const HOME_POPULATE = ['poster', 'categories'] as const;

async function fetchGenreRankedMovies(
  queryParams: MovieFilters,
  page: number,
  pageSize: number
): Promise<PaginatedResult<Movie> | null> {
  const genres = (queryParams.genres ?? []).filter(Boolean);

  const params: Record<string, string | string[] | undefined> = {
    [GENRE_RANKED_PARAM_KEYS.genres]: genres,
    [GENRE_RANKED_PAGINATION_KEYS.page]: String(page),
    [GENRE_RANKED_PAGINATION_KEYS.pageSize]: String(pageSize),
  };

  if (queryParams.sort) {
    params[GENRE_RANKED_PARAM_KEYS.sort] = queryParams.sort;
  }

  if (
    typeof queryParams.minRating === 'number' &&
    Number.isFinite(queryParams.minRating)
  ) {
    params[GENRE_RANKED_PARAM_KEYS.minRating] = String(
      queryParams.minRating
    );
  }

  if (
    typeof queryParams.fromYear === 'number' &&
    Number.isFinite(queryParams.fromYear)
  ) {
    params[GENRE_RANKED_PARAM_KEYS.fromYear] = String(
      queryParams.fromYear
    );
  }

  if (
    typeof queryParams.toYear === 'number' &&
    Number.isFinite(queryParams.toYear)
  ) {
    params[GENRE_RANKED_PARAM_KEYS.toYear] = String(queryParams.toYear);
  }

  if (
    typeof queryParams.fromRuntime === 'number' &&
    Number.isFinite(queryParams.fromRuntime)
  ) {
    params[GENRE_RANKED_PARAM_KEYS.fromRuntime] = String(
      queryParams.fromRuntime
    );
  }

  if (
    typeof queryParams.toRuntime === 'number' &&
    Number.isFinite(queryParams.toRuntime)
  ) {
    params[GENRE_RANKED_PARAM_KEYS.toRuntime] = String(
      queryParams.toRuntime
    );
  }

  if (queryParams.country) {
    params[GENRE_RANKED_PARAM_KEYS.country] = queryParams.country;
  }

  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/movies/genre-ranked',
    params,
    {
      next: {
        revalidate: 3600,
        tags: ['movies', 'movies:list', 'movies:genre-ranked'],
      },
    }
  );

  if (!json) {
    return null;
  }

  return {
    data: normalizeMovieList(json),
    hasMore: getHasMore(json, page, pageSize),
    page,
    pageSize,
  };
}

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

  if (shouldUseGenreMatchRanking(queryParams.genres)) {
    const rankedResult = await fetchGenreRankedMovies(
      queryParams,
      safePage,
      safePageSize
    );
    if (rankedResult) {
      return rankedResult;
    }

    logger.warn(
      'Genre ranked endpoint failed. Falling back to standard movie list query.',
      {
        component: 'MoviesRepository',
        action: 'fetchMoviesWithFilters',
        genres: queryParams.genres,
      }
    );
  }

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
        revalidate: 3600,
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
  // El home usa createdAt (últimas agregadas a la base).
  // El resto del sitio usa year/rating/id (ver movieParams.ts).
  const params = {
    ...buildPopulateParams(HOME_POPULATE),
    'pagination[page]': '1',
    'pagination[pageSize]': String(HOME_PAGE_SIZE),
    'sort[0]': 'createdAt:desc',
    'sort[1]': 'id:desc',
  };

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
