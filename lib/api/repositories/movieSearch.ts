import type { Movie } from '@/entities/movie';
import type { StrapiListResponse } from '@/lib/api/strapi/types';
import { fetchApi } from '@/lib/api/http/client';
import { normalizeMovieList } from '@/lib/api/strapi/normalizers';

export interface MovieSearchRepository {
  searchUnified(query: string, limit: number): Promise<Movie[]>;
}

export const movieSearchRepository: MovieSearchRepository = {
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
    return normalizeMovieList(json);
  },
};
