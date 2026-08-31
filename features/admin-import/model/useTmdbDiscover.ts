// features/admin-import/model/useTmdbDiscover.ts
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AdminSearchMovieResult } from '../types';

const ADMIN_IMPORT_DEFAULT_SORT = 'oldest';

/**
* Carga películas desde TMDB Discover usando los filtros
* presentes en la URL (los mismos que el catálogo).
*
* Solo está activo en el tab de películas y cuando NO hay
* una búsqueda por texto activa (param q).
*/
export function useTmdbDiscover() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<AdminSearchMovieResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(1);

  const hasQuery = Boolean(searchParams.get('q'));
  const tab = searchParams.get('tab') ?? 'movie';
  const isActive = tab === 'movie' && !hasQuery;

  // Clave de filtros para detectar cambios (excluye q, tab y page)
  const filterKey = (() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('tab');
    params.delete('page');
    return params.toString();
  })();

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setIsLoading(true);
      if (!append) setError(null);

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams(filterKey);
        if (!params.get('sort')) {
          params.set('sort', ADMIN_IMPORT_DEFAULT_SORT);
        }
        params.set('page', String(pageNum));

        const res = await fetch(
          `/api/admin/tmdb/discover?${params.toString()}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('discover failed');
        const data = await res.json();

        setMovies((prev) =>
          append ? [...prev, ...(data.results ?? [])] : (data.results ?? [])
        );
        setHasMore(Boolean(data.hasMore));
        pageRef.current = pageNum;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError('Error al cargar películas de TMDB');
      } finally {
        loadingRef.current = false;
        setIsLoading(false);
      }
    },
    [filterKey]
  );

  // Reset y fetch cuando cambian los filtros o el modo activo
  useEffect(() => {
    if (!isActive) return;
    setMovies([]);
    setHasMore(false);
    pageRef.current = 1;
    fetchPage(1, false);
  }, [isActive, filterKey, fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current) return;
    fetchPage(pageRef.current + 1, true);
  }, [hasMore, fetchPage]);

  return { movies, hasMore, isLoading, error, loadMore, isActive };
}
