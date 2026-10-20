import type { MovieSort } from '@/entities/movie';

export interface MovieSortOption {
  value: MovieSort;
  label: string;
}

export const MOVIE_SORT_OPTIONS: readonly MovieSortOption[] = [
  { value: 'latest', label: 'Recent' },
  { value: 'views', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'rating-asc', label: 'Lowest Rated' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title', label: 'A - Z' },
  { value: 'title-desc', label: 'Z - A' },
];
