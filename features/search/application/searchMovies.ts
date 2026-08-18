// features/search/application/searchMovies.ts

import type { Movie } from '@/types';
import type { PaginatedResult } from '@/lib/api/pagination/types';
import { SEARCH_PAGE_SIZE } from '@/lib/api/pagination/config';
import { normalizeSearchTerm } from '../domain/normalize';
import { mergeSearchResults } from '../domain/mergeSearchResults';
import {
  strapiMovieSearchRepository,
  type MovieSearchRepository,
} from '../infrastructure/strapiMovieSearchRepository';
import { logger } from '@/lib/utils/logger';

export async function searchMovies(
  query: string,
  page: number = 1,
  pageSize: number = SEARCH_PAGE_SIZE,
  repository: MovieSearchRepository = strapiMovieSearchRepository
): Promise<PaginatedResult<Movie>> {
  const safeQuery = query.trim();

  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safePageSize = Math.max(
    1,
    Math.floor(Number(pageSize) || SEARCH_PAGE_SIZE)
  );

  if (!safeQuery) {
    return {
      data: [],
      hasMore: false,
      page: safePage,
      pageSize: safePageSize,
    };
  }

  const normalizedQuery = normalizeSearchTerm(safeQuery);

  const titleLimit = Math.min(Math.max(safePageSize * 4, 80), 200);
  const otherLimit = Math.min(Math.max(safePageSize * 2, 40), 100);

  const [
    titleMovies,
    actorMovies,
    directorMovies,
    categoryMovies,
  ] = await Promise.all([
    repository.byTitle(safeQuery, titleLimit),
    repository.byActor(safeQuery, otherLimit),
    repository.byDirector(safeQuery, otherLimit),
    repository.byCategory(safeQuery, otherLimit),
  ]);

  const mergedMovies = mergeSearchResults(
    [
      { movies: titleMovies, source: 'title' },
      { movies: actorMovies, source: 'actor' },
      { movies: directorMovies, source: 'director' },
      { movies: categoryMovies, source: 'category' },
    ],
    normalizedQuery
  );

  const start = (safePage - 1) * safePageSize;
  const pagedMovies = mergedMovies.slice(start, start + safePageSize);
  const hasMore = start + safePageSize < mergedMovies.length;

  logger.debug('Search results merged', {
    component: 'Search',
    action: 'searchMovies',
    query: safeQuery,
    count: mergedMovies.length,
  });

  return {
    data: pagedMovies,
    hasMore,
    page: safePage,
    pageSize: safePageSize,
  };
}