'use client';
import { useCallback, useMemo } from 'react';
import {
  useRouter,
  useSearchParams,
  usePathname,
} from 'next/navigation';
import {
  YEAR_MIN,
  YEAR_MAX,
  RUNTIME_MIN,
  RUNTIME_MAX,
} from '../config/options';
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
  fromRuntime: number | null;
  toRuntime: number | null;
  hasRuntimeFilter: boolean;
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
  applyRuntimeRange: (fromRuntime: number, toRuntime: number) => void;
  removeRuntime: () => void;
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
    fromRuntime,
    toRuntime,
    hasRuntimeFilter,
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

  const applyRuntimeRange = useCallback(
    (nextFromRuntime: number, nextToRuntime: number) => {
      replaceParams((params) => {
        if (nextFromRuntime > RUNTIME_MIN) {
          params.set(
            MOVIE_FILTER_PARAM_KEYS.fromRuntime,
            String(nextFromRuntime)
          );
        } else {
          params.delete(MOVIE_FILTER_PARAM_KEYS.fromRuntime);
        }
        if (nextToRuntime < RUNTIME_MAX) {
          params.set(
            MOVIE_FILTER_PARAM_KEYS.toRuntime,
            String(nextToRuntime)
          );
        } else {
          params.delete(MOVIE_FILTER_PARAM_KEYS.toRuntime);
        }
      });
    },
    [replaceParams]
  );

  const removeRuntime = useCallback(() => {
    replaceParams((params) => {
      params.delete(MOVIE_FILTER_PARAM_KEYS.fromRuntime);
      params.delete(MOVIE_FILTER_PARAM_KEYS.toRuntime);
    });
  }, [replaceParams]);

  /**
  * Limpia todos los filtros, incluido el ordenamiento.
  */
  const clearFilters = useCallback(() => {
    replaceParams((params) => {
      params.delete(MOVIE_FILTER_PARAM_KEYS.genres);
      params.delete(MOVIE_FILTER_PARAM_KEYS.minRating);
      params.delete(MOVIE_FILTER_PARAM_KEYS.fromYear);
      params.delete(MOVIE_FILTER_PARAM_KEYS.toYear);
      params.delete(MOVIE_FILTER_PARAM_KEYS.fromRuntime);
      params.delete(MOVIE_FILTER_PARAM_KEYS.toRuntime);
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
    fromRuntime,
    toRuntime,
    hasRuntimeFilter,
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
    applyRuntimeRange,
    removeRuntime,
    clearFilters,
  };
}
