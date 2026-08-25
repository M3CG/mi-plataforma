'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface AutocompleteSuggestion {
  id: number;
  title: string;
  slug: string;
  year: number;
  rating: number;
  posterUrl?: string;
  score: number;
}

interface UseAutocompleteResult {
  suggestions: AutocompleteSuggestion[];
  isLoading: boolean;
  error: string | null;
}

const AUTOCOMPLETE_CACHE_KEY = 'autocomplete_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const DEBOUNCE_MS = 300;

interface CacheEntry {
  suggestions: AutocompleteSuggestion[];
  timestamp: number;
}

function getCachedSuggestions(query: string): AutocompleteSuggestion[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem(AUTOCOMPLETE_CACHE_KEY);
    if (!cached) return null;
    const cache: Record<string, CacheEntry> = JSON.parse(cached);
    const entry = cache[query.toLowerCase()];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      delete cache[query.toLowerCase()];
      sessionStorage.setItem(AUTOCOMPLETE_CACHE_KEY, JSON.stringify(cache));
      return null;
    }
    return entry.suggestions;
  } catch {
    return null;
  }
}

function setCachedSuggestions(query: string, suggestions: AutocompleteSuggestion[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cached = sessionStorage.getItem(AUTOCOMPLETE_CACHE_KEY);
    const cache: Record<string, CacheEntry> = cached ? JSON.parse(cached) : {};
    cache[query.toLowerCase()] = {
      suggestions,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(AUTOCOMPLETE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignorar errores de quota
  }
}

const EMPTY_SUGGESTIONS: AutocompleteSuggestion[] = [];

export function useAutocomplete(query: string): UseAutocompleteResult {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>(EMPTY_SUGGESTIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Derivar "debería mostrar sugerencias" durante el render.
  // Evita el setState dentro de useEffect (react-hooks/set-state-in-effect).
  const shouldFetch = query.length >= 2;

  // Si la query ya no califica, derivamos un array vacío sin tocar el state.
  const effectiveSuggestions = useMemo(
    () => (shouldFetch ? suggestions : EMPTY_SUGGESTIONS),
    [shouldFetch, suggestions]
  );

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    // Verificar caché primero
    const cached = getCachedSuggestions(searchQuery);
    if (cached) {
      setSuggestions(cached);
      return;
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/movies/autocomplete?q=${encodeURIComponent(searchQuery)}&limit=8`,
        { signal: abortController.signal }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      const newSuggestions = data.suggestions || [];

      setSuggestions(newSuggestions);
      setCachedSuggestions(searchQuery, newSuggestions);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request cancelada, no es un error
      }
      setError('Error al cargar sugerencias');
      setSuggestions(EMPTY_SUGGESTIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!shouldFetch) {
      // No hay nada que buscar: no tocamos el state, lo derivamos en render.
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, shouldFetch, fetchSuggestions]);

  return { suggestions: effectiveSuggestions, isLoading, error };
}
