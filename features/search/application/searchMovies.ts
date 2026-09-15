// features/search/application/searchMovies.ts
import type { Movie } from '@/entities/movie';
import { SEARCH_PAGE_SIZE } from '@/lib/api/pagination/config';
import { tmdbSearchMovies } from '@/lib/api/tmdb/client';
import { normalizeTmdbSearchToMovies } from '@/lib/api/tmdb/catalogNormalizer';
import { logger } from '@/lib/utils/logger';

/**
 * Busca películas en TMDB.
 *
 * Ya NO consulta Strapi. Todo viene de TMDB Search.
 * El repository de Strapi se mantiene para compatibilidad
 * pero no se usa en el flujo principal.
 */
export async function searchMovies(
  query: string,
  limit: number = SEARCH_PAGE_SIZE * 4
): Promise<Movie[]> {
  const safeQuery = query.trim();
  if (!safeQuery || safeQuery.length < 2) {
    return [];
  }

  try {
    const results = await tmdbSearchMovies(safeQuery);
    const movies = normalizeTmdbSearchToMovies(results?.results ?? []);

    logger.debug('TMDB search completed', {
      component: 'Search',
      action: 'searchMovies',
      query: safeQuery,
      count: movies.length,
    });

    return movies.slice(0, limit);
  } catch (error) {
    logger.error('TMDB search failed', {
      component: 'Search',
      action: 'searchMovies',
      query: safeQuery,
      error,
    });
    return [];
  }
}