// features/catalog/model/useGridStatePersistence.ts
'use client';

import { useEffect } from 'react';
import type { Movie } from '@/entities/movie';
import { writeGridState } from '../lib/gridStateStorage';

interface UseGridStatePersistenceProps {
  filterKey: string;
  movies: Movie[];
  hasMore: boolean;
  page: number;
  initialMoviesLength: number;
}

/**
 * Responsabilidad única:
 * persistir el estado del grid cuando el usuario cargó más páginas.
 */
export function useGridStatePersistence({
  filterKey,
  movies,
  hasMore,
  page,
  initialMoviesLength,
}: UseGridStatePersistenceProps) {
  useEffect(() => {
    if (movies.length > initialMoviesLength) {
      writeGridState(filterKey, {
        movies,
        hasMore,
        page,
      });
    }
  }, [movies, hasMore, page, filterKey, initialMoviesLength]);
}