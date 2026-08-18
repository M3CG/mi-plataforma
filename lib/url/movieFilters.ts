// lib/url/movieFilters.ts
import {
  DEFAULT_MOVIE_SORT,
  isMovieSort,
  clampMovieYear,
  type MovieFilters,
  type MovieFiltersQuery,
} from '@/entities/movie';
import { MOVIE_FILTER_PARAM_KEYS } from './movieFilterParams';

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
*
* Responsabilidad:
* - convertir query params crudos a MovieFilters tipado
* - sanear valores inválidos
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
    country,
    sort,
  };
}

/**
* Parsea filtros desde el objeto searchParams de Next.js.
*
* Este parser existe porque en server components recibimos
* un objeto plano, no una instancia de URLSearchParams.
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
*
* Responsabilidad:
* - convertir MovieFilters tipado a URLSearchParams
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

  if (filters.country) {
    params.set(MOVIE_FILTER_PARAM_KEYS.country, filters.country);
  }

  if (filters.sort && filters.sort !== DEFAULT_MOVIE_SORT) {
    params.set(MOVIE_FILTER_PARAM_KEYS.sort, filters.sort);
  }

  return params;
}
