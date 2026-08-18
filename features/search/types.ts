import type { Movie } from '@/entities/movie';

export interface SearchPageData {
  query: string;
  normalizedQuery: string;
  hasQuery: boolean;
  results: Movie[];
  count: number;
  hasResults: boolean;
}
