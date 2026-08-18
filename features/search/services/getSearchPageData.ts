// features/search/services/getSearchPageData.ts

import type { SearchPageData } from '../types';
import { normalizeSearchQuery } from '../lib/normalizeSearchQuery';
import { searchMovies } from '../application/searchMovies';

export async function getSearchPageData(
  rawQuery?: string | string[]
): Promise<SearchPageData> {
  const normalizedQuery = normalizeSearchQuery(rawQuery);

  if (!normalizedQuery) {
    return {
      query: '',
      normalizedQuery: '',
      hasQuery: false,
      results: [],
      count: 0,
      hasResults: false,
      hasMore: false,
    };
  }

  const result = await searchMovies(normalizedQuery);

  return {
    query: normalizedQuery,
    normalizedQuery,
    hasQuery: true,
    results: result.data,
    count: result.data.length,
    hasResults: result.data.length > 0,
    hasMore: result.hasMore,
  };
}