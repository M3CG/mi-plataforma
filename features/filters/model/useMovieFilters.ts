'use client';

import { useCallback, useMemo } from 'react';
import {
  useRouter,
  useSearchParams,
  usePathname,
} from 'next/navigation';
import { YEAR_MIN, YEAR_MAX } from '../config/options';
import { buildFiltersUrl } from '../lib/filterUrlSerializer';
import {
  DEFAULT_MOVIE_SORT,
  MOVIE_FILTER_PARAM_KEYS,
  type MovieFilterParamKey,
  type MovieSort,
} from '@/entities/movie';
import { parseMovieFiltersForUI } from '@/lib/url/movieFilters';

export interface UseMovieFiltersResult {
  activeGenres: string[];
  minRating: string | null;
  country: string | null;
  sort: MovieSort;
  fromYear: number | null;
  toYear: number | null;
  hasYearFilter: boolean;
  filterCount: number;
  toggleGenre: (slug: string) => void;
  removeGenre: (slug: string) => void;
  setRating: (value: string | null) => void;
  removeRating: () => void;
  setCountry: (value: string | null) => void;
  removeCountry: () => void;
  setSort: (value: MovieSort) => void;
  applyYearRange: (fromYear: number, toYear: number) => void;
  removeYear: () => void;
  clearFilters: () => void;
}

export function useMovieFilters(): UseMovieFiltersResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const uiState = useMemo(
    () => parseMovieFiltersForUI(searchParams),
    [searchParams]
  );

  const {
    activeGenres,
    minRating,
    country,
    sort,
    fromYear,
    toYear,
    hasYearFilter,
    filterCount,
  } = uiState;

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const url = buildFiltersUrl(pathname, mutate, searchParams);
      router.replace(url);
    },
    [router, searchParams, pathname]
  );

  const updateParam = useCallback(
    (key: MovieFilterParamKey, value: string | null) => {
      replaceParams((params) => {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
    },
    [replaceParams]
  );

  const toggleGenre = useCallback(
    (slug: string) => {
      replaceParams((params) => {
        const genreKey = MOVIE_FILTER_PARAM_KEYS.genres;
        const currentGenres = params.getAll(genreKey);
        params.delete(genreKey);

        if (currentGenres.includes(slug)) {
          currentGenres
            .filter((genre) => genre !== slug)
            .forEach((genre) => params.append(genreKey, genre));
        } else {
          [...currentGenres, slug].forEach((genre) =>
            params.append(genreKey, genre)
          );
        }
      });
    },
    [replaceParams]
  );

  const removeGenre = useCallback(
    (slug: string) => {
      toggleGenre(slug);
    },
    [toggleGenre]
  );

  const setRating = useCallback(
    (value: string | null) =>
      updateParam(MOVIE_FILTER_PARAM_KEYS.minRating, value),
    [updateParam]
  );

  const removeRating = useCallback(() => {
    updateParam(MOVIE_FILTER_PARAM_KEYS.minRating, null);
  }, [updateParam]);

  const setCountry = useCallback(
    (value: string | null) =>
      updateParam(MOVIE_FILTER_PARAM_KEYS.country, value),
    [updateParam]
  );

  const removeCountry = useCallback(() => {
    updateParam(MOVIE_FILTER_PARAM_KEYS.country, null);
  }, [updateParam]);

  const setSort = useCallback(
    (value: MovieSort) =>
      updateParam(
        MOVIE_FILTER_PARAM_KEYS.sort,
        value === DEFAULT_MOVIE_SORT ? null : value
      ),
    [updateParam]
  );

  const applyYearRange = useCallback(
    (nextFromYear: number, nextToYear: number) => {
      replaceParams((params) => {
        if (nextFromYear > YEAR_MIN) {
          params.set(
            MOVIE_FILTER_PARAM_KEYS.fromYear,
            String(nextFromYear)
          );
        } else {
          params.delete(MOVIE_FILTER_PARAM_KEYS.fromYear);
        }

        if (nextToYear < YEAR_MAX) {
          params.set(
            MOVIE_FILTER_PARAM_KEYS.toYear,
            String(nextToYear)
          );
        } else {
          params.delete(MOVIE_FILTER_PARAM_KEYS.toYear);
        }
      });
    },
    [replaceParams]
  );

  const removeYear = useCallback(() => {
    replaceParams((params) => {
      params.delete(MOVIE_FILTER_PARAM_KEYS.fromYear);
      params.delete(MOVIE_FILTER_PARAM_KEYS.toYear);
    });
  }, [replaceParams]);

  /**
   * Limpia todos los filtros, incluido el ordenamiento.
   *
   * Semántica:
   * "Limpiar filtros" lleva al usuario al estado inicial
   * del catálogo, sin ningún filtro ni orden personalizado.
   * El sort vuelve a su valor por defecto (latest).
   */
  const clearFilters = useCallback(() => {
    replaceParams((params) => {
      params.delete(MOVIE_FILTER_PARAM_KEYS.genres);
      params.delete(MOVIE_FILTER_PARAM_KEYS.minRating);
      params.delete(MOVIE_FILTER_PARAM_KEYS.fromYear);
      params.delete(MOVIE_FILTER_PARAM_KEYS.toYear);
      params.delete(MOVIE_FILTER_PARAM_KEYS.country);
      params.delete(MOVIE_FILTER_PARAM_KEYS.sort);
    });
  }, [replaceParams]);

  return {
    activeGenres,
    minRating,
    country,
    sort,
    fromYear,
    toYear,
    hasYearFilter,
    filterCount,
    toggleGenre,
    removeGenre,
    setRating,
    removeRating,
    setCountry,
    removeCountry,
    setSort,
    applyYearRange,
    removeYear,
    clearFilters,
  };
}
