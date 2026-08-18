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
    };
  }

  const results = await searchMovies(normalizedQuery);

  return {
    query: normalizedQuery,
    normalizedQuery,
    hasQuery: true,
    results,
    count: results.length,
    hasResults: results.length > 0,
  };
}
