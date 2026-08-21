// lib/url/movieFilters.ts
import {
  DEFAULT_MOVIE_SORT,
  isMovieSort,
  clampMovieYear,
  clampMovieRuntime,
  MOVIE_FILTER_PARAM_KEYS,
  type MovieFilters,
  type MovieFiltersQuery,
  type MovieSort,
} from '@/entities/movie';

function parseStringArray(
  value: string | string[] | undefined
): string[] {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  const flattened = values.flatMap((item) => item.split(','));
  const cleaned = flattened
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set(cleaned));
}

function parseNumber(
  value: string | string[] | undefined
): number | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  if (first === undefined || first === null || first === '') {
    return undefined;
  }
  const parsed = Number(first);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
* Parsea filtros de dominio desde URLSearchParams.
*/
export function parseMovieFiltersFromSearchParams(
  searchParams: URLSearchParams
): MovieFilters {
  const genres = parseStringArray(
    searchParams.getAll(MOVIE_FILTER_PARAM_KEYS.genres)
  );

  const minRatingRaw = parseNumber(
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.minRating) ?? undefined
  );
  const minRating =
    minRatingRaw === undefined
      ? undefined
      : Math.min(Math.max(minRatingRaw, 0), 10);

  let fromYear = parseNumber(
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.fromYear) ?? undefined
  );
  let toYear = parseNumber(
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.toYear) ?? undefined
  );
  if (fromYear !== undefined) {
    fromYear = clampMovieYear(fromYear);
  }
  if (toYear !== undefined) {
    toYear = clampMovieYear(toYear);
  }
  if (
    fromYear !== undefined &&
    toYear !== undefined &&
    fromYear > toYear
  ) {
    [fromYear, toYear] = [toYear, fromYear];
  }

  let fromRuntime = parseNumber(
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.fromRuntime) ?? undefined
  );
  let toRuntime = parseNumber(
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.toRuntime) ?? undefined
  );
  if (fromRuntime !== undefined) {
    fromRuntime = clampMovieRuntime(fromRuntime);
  }
  if (toRuntime !== undefined) {
    toRuntime = clampMovieRuntime(toRuntime);
  }
  if (
    fromRuntime !== undefined &&
    toRuntime !== undefined &&
    fromRuntime > toRuntime
  ) {
    [fromRuntime, toRuntime] = [toRuntime, fromRuntime];
  }

  const countryRaw =
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.country) ?? undefined;
  const country = countryRaw?.trim() || undefined;

  const sortParam =
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.sort) ?? undefined;
  const sort = isMovieSort(sortParam) ? sortParam : undefined;

  return {
    genres: genres.length ? genres : undefined,
    minRating,
    fromYear,
    toYear,
    fromRuntime,
    toRuntime,
    country,
    sort,
  };
}

/**
* Parsea filtros desde el objeto searchParams de Next.js.
*/
export function parseMovieFiltersFromRecord(
  record: MovieFiltersQuery
): MovieFilters {
  const params = new URLSearchParams();
  Object.entries(record).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) params.append(key, item);
      });
    } else {
      params.set(key, value);
    }
  });
  return parseMovieFiltersFromSearchParams(params);
}

/**
* Serializa filtros de dominio a query params.
*/
export function serializeMovieFiltersToSearchParams(
  filters: MovieFilters
): URLSearchParams {
  const params = new URLSearchParams();

  (filters.genres ?? []).forEach((genre) => {
    params.append(MOVIE_FILTER_PARAM_KEYS.genres, genre);
  });

  if (
    typeof filters.minRating === 'number' &&
    Number.isFinite(filters.minRating)
  ) {
    params.set(
      MOVIE_FILTER_PARAM_KEYS.minRating,
      String(filters.minRating)
    );
  }

  if (
    typeof filters.fromYear === 'number' &&
    Number.isFinite(filters.fromYear)
  ) {
    params.set(
      MOVIE_FILTER_PARAM_KEYS.fromYear,
      String(filters.fromYear)
    );
  }
  if (
    typeof filters.toYear === 'number' &&
    Number.isFinite(filters.toYear)
  ) {
    params.set(
      MOVIE_FILTER_PARAM_KEYS.toYear,
      String(filters.toYear)
    );
  }

  if (
    typeof filters.fromRuntime === 'number' &&
    Number.isFinite(filters.fromRuntime)
  ) {
    params.set(
      MOVIE_FILTER_PARAM_KEYS.fromRuntime,
      String(filters.fromRuntime)
    );
  }
  if (
    typeof filters.toRuntime === 'number' &&
    Number.isFinite(filters.toRuntime)
  ) {
    params.set(
      MOVIE_FILTER_PARAM_KEYS.toRuntime,
      String(filters.toRuntime)
    );
  }

  if (filters.country) {
    params.set(MOVIE_FILTER_PARAM_KEYS.country, filters.country);
  }
  if (filters.sort && filters.sort !== DEFAULT_MOVIE_SORT) {
    params.set(MOVIE_FILTER_PARAM_KEYS.sort, filters.sort);
  }

  return params;
}

/**
* Estado de filtros listo para ser consumido por la UI.
*/
export interface MovieFiltersUIState {
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
}

/**
* Parsea la URL y devuelve un estado listo para la UI.
*/
export function parseMovieFiltersForUI(
  searchParams: URLSearchParams
): MovieFiltersUIState {
  const domainFilters = parseMovieFiltersFromSearchParams(searchParams);

  const activeGenres = domainFilters.genres ?? [];

  const minRating =
    domainFilters.minRating !== undefined
      ? String(domainFilters.minRating)
      : null;

  const country = domainFilters.country ?? null;
  const sort = domainFilters.sort ?? DEFAULT_MOVIE_SORT;

  const fromYear = domainFilters.fromYear ?? null;
  const toYear = domainFilters.toYear ?? null;
  const hasYearFilter =
    searchParams.has(MOVIE_FILTER_PARAM_KEYS.fromYear) ||
    searchParams.has(MOVIE_FILTER_PARAM_KEYS.toYear);

  const fromRuntime = domainFilters.fromRuntime ?? null;
  const toRuntime = domainFilters.toRuntime ?? null;
  const hasRuntimeFilter =
    searchParams.has(MOVIE_FILTER_PARAM_KEYS.fromRuntime) ||
    searchParams.has(MOVIE_FILTER_PARAM_KEYS.toRuntime);

  const filterCount =
    activeGenres.length +
    (minRating ? 1 : 0) +
    (hasYearFilter ? 1 : 0) +
    (hasRuntimeFilter ? 1 : 0) +
    (country ? 1 : 0);

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
  };
}
