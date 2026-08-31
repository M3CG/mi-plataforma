// features/admin-import/model/usePersonFilmography.ts
'use client';
import { useCallback, useState } from 'react';
import type { FilmographyMovie } from '../types';

export function usePersonFilmography() {
  const [castMovies, setCastMovies] = useState<FilmographyMovie[]>([]);
  const [crewMovies, setCrewMovies] = useState<FilmographyMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (tmdbId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/tmdb/person/filmography?id=${tmdbId}`
      );
      if (!res.ok) throw new Error('filmography failed');
      const data = await res.json();
      setCastMovies(data.cast ?? []);
      setCrewMovies(data.crew ?? []);
    } catch {
      setError('Could not load the filmography.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { castMovies, crewMovies, isLoading, error, load };
}
