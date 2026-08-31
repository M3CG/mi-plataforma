// features/admin-import/model/useTmdbSearch.ts
'use client';
import { useCallback, useRef, useState } from 'react';
import type {
  AdminSearchMovieResult,
  AdminSearchPersonResult,
} from '../types';

export function useTmdbSearch() {
  const [movieResults, setMovieResults] = useState<
    AdminSearchMovieResult[]
  >([]);
  const [personResults, setPersonResults] = useState<
    AdminSearchPersonResult[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (query: string, type: 'movie' | 'person') => {
      const safeQuery = query.trim();
      if (safeQuery.length < 2) return;
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/tmdb/search?q=${encodeURIComponent(safeQuery)}&type=${type}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('search failed');
        const data = await res.json();
        if (type === 'movie') {
          setMovieResults(data.results ?? []);
          setPersonResults([]);
        } else {
          setPersonResults(data.results ?? []);
          setMovieResults([]);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError('Error searching TMDB. Check TMDB_API_KEY.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { movieResults, personResults, isLoading, error, search };
}
