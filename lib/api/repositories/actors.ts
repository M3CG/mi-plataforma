// lib/api/repositories/actors.ts
import type { Actor, Movie } from '@/types';
import type { StrapiListResponse } from '../strapi/types';

import { fetchApi } from '../http/client';
import { getHasMore } from '../strapi/pagination';

import {
  normalizePerson,
  normalizeMovieList,
} from '../strapi/normalizers';

import {
  buildPopulateParams,
  MOVIE_LIST_POPULATE,
} from '../strapi/populate';

import { isValidSlug } from '@/lib/utils/slugify';
import { logger } from '@/lib/utils/logger';

export async function fetchActorBySlug(
  slug: string
): Promise<Actor | null> {
  if (!isValidSlug(slug)) {
    logger.warn('Slug inválido recibido', {
      component: 'ActorsRepository',
      action: 'fetchActorBySlug',
      slug,
    });

    return null;
  }

  const params = {
    'filters[slug]': slug,
  };

  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/actors',
    params,
    {
      next: {
        revalidate: 3600,
        tags: ['actors', `actor:${slug}`],
      },
    }
  );

  if (!json?.data || !Array.isArray(json.data) || json.data.length === 0) {
    logger.debug('Ningún actor encontrado para slug', {
      component: 'ActorsRepository',
      action: 'fetchActorBySlug',
      slug,
    });

    return null;
  }

  return normalizePerson(json.data[0]) ?? null;
}

export async function fetchMoviesByActor(
  actorSlug: string,
  page: number = 1,
  pageSize: number = 60
): Promise<{ data: Movie[]; hasMore: boolean }> {
  if (!isValidSlug(actorSlug)) {
    logger.warn('Slug inválido recibido', {
      component: 'ActorsRepository',
      action: 'fetchMoviesByActor',
      slug: actorSlug,
    });

    return { data: [], hasMore: false };
  }

  const params = {
    'filters[actors][slug]': actorSlug,
    ...buildPopulateParams(MOVIE_LIST_POPULATE),
    'pagination[page]': String(page),
    'pagination[pageSize]': String(pageSize),
    'sort[0]': 'year:desc',
    'sort[1]': 'rating:desc',
    'sort[2]': 'id:desc',
  };

  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/movies',
    params,
    {
      next: {
        revalidate: 3600,
        tags: ['movies', `actor:${actorSlug}`],
      },
    }
  );

  return {
    data: normalizeMovieList(json),
    hasMore: getHasMore(json, page, pageSize),
  };
}