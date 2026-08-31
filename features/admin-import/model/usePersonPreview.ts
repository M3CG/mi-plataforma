// features/admin-import/model/usePersonPreview.ts
'use client';
import { useCallback, useState } from 'react';
import type { PersonPreview, SlugCandidate } from '../types';

export function usePersonPreview() {
  const [preview, setPreview] = useState<PersonPreview | null>(null);
  const [slugCandidates, setSlugCandidates] = useState<SlugCandidate[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (tmdbId: number) => {
    setIsLoading(true);
    setError(null);
    setPreview(null);
    setSlugCandidates([]);
    try {
      const res = await fetch(`/api/admin/tmdb/person?id=${tmdbId}`);
      if (!res.ok) throw new Error('preview failed');
      const data = await res.json();
      setPreview(data.preview);
      setSlugCandidates(data.slugCandidates ?? []);
    } catch {
      setError('Could not load the actor preview.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { preview, slugCandidates, isLoading, error, load };
}
