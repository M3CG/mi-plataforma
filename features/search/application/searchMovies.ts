import type { Movie } from '@/entities/movie';
import { SEARCH_PAGE_SIZE } from '@/lib/api/pagination/config';
import { normalizeSearchTerm } from '../domain/normalize';
import {
  movieSearchQueries,
  type MovieSearchRepository,
} from '@/lib/queries/search';
import { logger } from '@/lib/utils/logger';

export async function searchMovies(
  query: string,
  limit: number = SEARCH_PAGE_SIZE * 4,
  repository: MovieSearchRepository = movieSearchQueries
): Promise<Movie[]> {
  const safeQuery = query.trim();
  if (!safeQuery || safeQuery.length < 2) {
    return [];
  }

  const normalizedQuery = normalizeSearchTerm(safeQuery);

  try {
    // Usamos el método unificado (1 sola query a Strapi con full-text search)
    const results = await repository.searchUnified(safeQuery, limit);

    logger.debug('Unified search completed', {
      component: 'Search',
      action: 'searchMovies',
      query: safeQuery,
      count: results.length,
    });

    return results.slice(0, limit);
  } catch (error) {
    logger.error('Unified search failed', {
      component: 'Search',
      action: 'searchMovies',
      query: safeQuery,
      error,
    });
    return [];
  }
}