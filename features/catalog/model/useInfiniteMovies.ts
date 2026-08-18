// features/catalog/model/useInfiniteMovies.ts
'use client';

import { useMemo } from 'react';
import type { Movie } from '@/types';
import type { MovieFilters } from '@/entities/movie/types/filters';
import { getFilterKey } from '../lib/gridStateStorage';
import { useMoviePagination } from './useMoviePagination';
import { useGridScrollRestore } from './useGridScrollRestore';
import { useGridStatePersistence } from './useGridStatePersistence';

interface UseInfiniteMoviesProps {
  initialMovies: Movie[];
  initialHasMore: boolean;
  filters: MovieFilters;
}

/**
 * Fachada pública del infinite scroll de catálogo.
 *
 * Composición interna:
 * - useMoviePagination
 * - useGridScrollRestore
 * - useGridStatePersistence
 */
export function useInfiniteMovies({
  initialMovies,
  initialHasMore,
  filters,
}: UseInfiniteMoviesProps) {
  const filterKey = useMemo(() => getFilterKey(filters), [filters]);

  const {
    movies,
    hasMore,
    page,
    isLoading,
    loadMore,
    restoreState,
  } = useMoviePagination({
    initialMovies,
    initialHasMore,
    filters,
    filterKey,
  });

  useGridScrollRestore(filterKey, restoreState);

  useGridStatePersistence({
    filterKey,
    movies,
    hasMore,
    page,
    initialMoviesLength: initialMovies.length,
  });

  return {
    movies,
    hasMore,
    isLoading,
    loadMore,
  };
}