// features/catalog/model/useMoviePagination.ts
'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Movie } from '@/entities/movie';
import type { MovieFilters } from '@/entities/movie/types/filters';
import { dedupeMovies } from '@/entities/movie';
import { logger } from '@/lib/utils/logger';
import { fetchMoviesFromApi } from '../infrastructure/moviesClient';
import type { SavedGridState } from '../lib/gridStateStorage';

interface UseMoviePaginationProps {
  initialMovies: Movie[];
  initialHasMore: boolean;
  filters: MovieFilters;
  filterKey: string;
}

/**
 * Responsabilidad única:
 * manejar el estado paginado del catálogo.
 */
export function useMoviePagination({
  initialMovies,
  initialHasMore,
  filters,
  filterKey,
}: UseMoviePaginationProps) {
  // Esto mantiene estable la referencia de filters mientras el filterKey no cambie.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFilters = useMemo(() => filters, [filterKey]);

  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadingRef = useRef(false);
  const prevFilterKeyRef = useRef(filterKey);
  const moviesRef = useRef(movies);

  useEffect(() => {
    moviesRef.current = movies;
  }, [movies]);

  // ─── Reset cuando cambian los filtros ───
  useEffect(() => {
    if (prevFilterKeyRef.current !== filterKey) {
      setMovies(initialMovies);
      setHasMore(initialHasMore);
      setPage(1);
      prevFilterKeyRef.current = filterKey;
    }
  }, [filterKey, initialMovies, initialHasMore]);

  const restoreState = useCallback((state: SavedGridState) => {
    setMovies(state.movies);
    setHasMore(state.hasMore);
    setPage(state.page);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setIsLoading(true);

    const nextPage = page + 1;

    try {
      const result = await fetchMoviesFromApi(
        stableFilters,
        nextPage
      );

      const uniqueMovies = dedupeMovies(
        moviesRef.current,
        result.data
      );

      // Si la API dice que hay más, pero todos los resultados vienen repetidos,
      // cortamos la carga para evitar loops infinitos.
      if (uniqueMovies.length === 0 && result.hasMore) {
        setHasMore(false);
        return;
      }

      setMovies((prevMovies) => [
        ...prevMovies,
        ...dedupeMovies(prevMovies, result.data),
      ]);

      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (error) {
      logger.error('Error loading more movies', {
        component: 'Catalog',
        action: 'loadMore',
        error,
        page: nextPage,
      });
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, page, stableFilters]);

  return {
    movies,
    hasMore,
    page,
    isLoading,
    loadMore,
    restoreState,
  };
}