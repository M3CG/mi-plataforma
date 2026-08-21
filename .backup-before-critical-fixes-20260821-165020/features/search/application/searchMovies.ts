import type { Movie } from '@/entities/movie';
import { SEARCH_PAGE_SIZE } from '@/lib/api/pagination/config';
import { normalizeSearchTerm } from '../domain/normalize';
import { mergeSearchResults } from '../domain/mergeSearchResults';
import {
  movieSearchQueries,
  type MovieSearchRepository,
} from '@/lib/queries/search';
import { logger } from '@/lib/utils/logger';

/**
 * Responsabilidad:
 * buscar películas por múltiples fuentes y devolver
 * un array consolidado y ordenado por relevancia.
 *
 * No expone paginación porque la UI actual consume
 * todos los resultados disponibles.
 */
export async function searchMovies(
  query: string,
  limit: number = SEARCH_PAGE_SIZE * 4,
  repository: MovieSearchRepository = movieSearchQueries
): Promise<Movie[]> {
  const safeQuery = query.trim();

  if (!safeQuery) {
    return [];
  }

  const normalizedQuery = normalizeSearchTerm(safeQuery);

  const titleLimit = Math.min(Math.max(limit, 80), 200);
  const otherLimit = Math.min(Math.max(Math.floor(limit / 2), 40), 100);

  const [
    titleResult,
    actorResult,
    directorResult,
    categoryResult,
  ] = await Promise.allSettled([
    repository.byTitle(safeQuery, titleLimit),
    repository.byActor(safeQuery, otherLimit),
    repository.byDirector(safeQuery, otherLimit),
    repository.byCategory(safeQuery, otherLimit),
  ]);

  const titleMovies =
    titleResult.status === 'fulfilled' ? titleResult.value : [];
  const actorMovies =
    actorResult.status === 'fulfilled' ? actorResult.value : [];
  const directorMovies =
    directorResult.status === 'fulfilled' ? directorResult.value : [];
  const categoryMovies =
    categoryResult.status === 'fulfilled' ? categoryResult.value : [];

  const mergedMovies = mergeSearchResults(
    [
      { movies: titleMovies, source: 'title' },
      { movies: actorMovies, source: 'actor' },
      { movies: directorMovies, source: 'director' },
      { movies: categoryMovies, source: 'category' },
    ],
    normalizedQuery
  );

  logger.debug('Search results merged', {
    component: 'Search',
    action: 'searchMovies',
    query: safeQuery,
    count: mergedMovies.length,
  });

  return mergedMovies.slice(0, limit);
}
