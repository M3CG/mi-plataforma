// features/admin-import/model/useMoviePreview.ts
'use client';
import { useCallback, useState } from 'react';
import type { MoviePreview, SlugCandidate } from '../types';

export function useMoviePreview() {
  const [preview, setPreview] = useState<MoviePreview | null>(null);
  const [slugCandidates, setSlugCandidates] = useState<SlugCandidate[]>([]);
  const [existsInDb, setExistsInDb] = useState(false);
  const [existingSlug, setExistingSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (tmdbId: number) => {
    setIsLoading(true);
    setError(null);
    setPreview(null);
    setSlugCandidates([]);
    setExistsInDb(false);
    setExistingSlug(null);
    try {
      const res = await fetch(`/api/admin/tmdb/movie?id=${tmdbId}`);
      if (!res.ok) throw new Error('preview failed');
      const data = await res.json();
      setPreview(data.preview);
      setSlugCandidates(data.slugCandidates ?? []);
      setExistsInDb(Boolean(data.existsInDb));
      setExistingSlug(data.existingSlug ?? null);
    } catch {
      setError('No se pudo cargar la previsualización.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    preview,
    slugCandidates,
    existsInDb,
    existingSlug,
    isLoading,
    error,
    load,
  };
}
