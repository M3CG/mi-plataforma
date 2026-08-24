import type { Movie } from '@/entities/movie';
import type { StrapiListResponse } from '@/lib/api/strapi/types';
import { fetchApi } from '@/lib/api/http/client';
import { normalizeMovie, normalizeMovieList } from '@/lib/api/strapi/normalizers';
import {
  buildPopulateParams,
  MOVIE_DETAIL_POPULATE,
} from '@/lib/api/strapi/populate';

const SEARCH_POPULATE = buildPopulateParams(MOVIE_DETAIL_POPULATE);

export interface MovieSearchRepository {
  byTitle(query: string, limit: number): Promise<Movie[]>;
  byActor(query: string, limit: number): Promise<Movie[]>;
  byDirector(query: string, limit: number): Promise<Movie[]>;
  byCategory(query: string, limit: number): Promise<Movie[]>;
  searchUnified(query: string, limit: number): Promise<Movie[]>;
}

async function runMovieSearch(
  params: Record<string, string>,
  limit: number
): Promise<Movie[]> {
  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/movies',
    {
      ...SEARCH_POPULATE,
      'pagination[page]': '1',
      'pagination[pageSize]': String(limit),
      ...params,
    },
    {
      cache: 'no-store',
    }
  );

  return normalizeMovieList(json);
}

export const movieSearchRepository: MovieSearchRepository = {
  async byTitle(query: string, limit: number): Promise<Movie[]> {
    let json = await fetchApi<StrapiListResponse<unknown>>(
      '/movies',
      {
        ...SEARCH_POPULATE,
        'pagination[page]': '1',
        'pagination[pageSize]': String(limit),
        'filters[$or][0][title][$containsi]': query,
        'filters[$or][1][english_title][$containsi]': query,
        'filters[$or][2][spanish_title][$containsi]': query,
      },
      {
        cache: 'no-store',
      }
    );

    if (json !== null) {
      return normalizeMovieList(json);
    }

    json = await fetchApi<StrapiListResponse<unknown>>(
      '/movies',
      {
        ...SEARCH_POPULATE,
        'pagination[page]': '1',
        'pagination[pageSize]': String(limit),
        'filters[title][$containsi]': query,
      },
      {
        cache: 'no-store',
      }
    );

    return normalizeMovieList(json);
  },

  async byActor(query: string, limit: number): Promise<Movie[]> {
    return runMovieSearch(
      {
        'filters[actors][name][$containsi]': query,
      },
      limit
    );
  },

  async byDirector(query: string, limit: number): Promise<Movie[]> {
    return runMovieSearch(
      {
        'filters[directors][name][$containsi]': query,
      },
      limit
    );
  },

  async byCategory(query: string, limit: number): Promise<Movie[]> {
    return runMovieSearch(
      {
        'filters[categories][name][$containsi]': query,
      },
      limit
    );
  },
  async searchUnified(query: string, limit: number): Promise<Movie[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const safeQuery = query.trim();

    // Llamamos al endpoint custom de Strapi que creamos
    const json = await fetchApi<StrapiListResponse<unknown>>(
      '/movies/search',
      {
        q: safeQuery,
        limit: String(Math.min(limit, 100)),
      },
      {
        cache: 'no-store',
      }
    );

    if (!json?.data || !Array.isArray(json.data)) {
      return [];
    }

    // El endpoint ya devuelve datos compatibles con el normalizador
    return normalizeMovieList(json as any);
  },
};