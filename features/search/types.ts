// features/search/types.ts

import type { Movie } from '@/types';

export interface SearchPageData {
  query: string;
  normalizedQuery: string;
  hasQuery: boolean;
  results: Movie[];
  count: number;
  hasResults: boolean;
  hasMore: boolean;
}