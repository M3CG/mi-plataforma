// lib/api/strapi/movieParams.ts
import {
  DEFAULT_MOVIE_SORT,
  clampMovieYear,
  clampMovieRuntime,
  type MovieFilters,
  type MovieSort,
} from '@/entities/movie';
import {
  buildPopulateParams,
  MOVIE_LIST_POPULATE,
} from './populate';

/**
* Presets de sorting traducidos a sintaxis de Strapi.
*/
const MOVIE_SORT_PRESETS: Record<MovieSort, string[]> = {
  latest: ['year:desc', 'rating:desc', 'id:desc'],
  oldest: ['year:asc', 'rating:desc', 'id:desc'],
  title: ['title:asc', 'year:desc', 'id:desc'],
  'title-desc': ['title:desc', 'year:desc', 'id:desc'],
  rating: ['rating:desc', 'year:desc', 'id:desc'],
  'rating-asc': ['rating:asc', 'year:desc', 'id:desc'],
};

function getMovieSortPreset(sort?: MovieSort): string[] {
  return MOVIE_SORT_PRESETS[sort ?? DEFAULT_MOVIE_SORT];
}

/**
* Construye parámetros de consulta para Strapi.
*/
export function buildMovieListParams(
  filters: MovieFilters,
  page: number,
  pageSize: number
): Record<string, string> {
  const params: Record<string, string> = {
    ...buildPopulateParams(MOVIE_LIST_POPULATE),
    'pagination[page]': String(page),
    'pagination[pageSize]': String(pageSize),
  };

  const sortPreset = getMovieSortPreset(filters.sort);
  sortPreset.forEach((sortValue, index) => {
    params[`sort[${index}]`] = sortValue;
  });

  const genres = filters.genres ?? [];
  genres.forEach((genre, index) => {
    params[`filters[categories][slug][$in][${index}]`] = genre;
  });

  if (
    typeof filters.minRating === 'number' &&
    Number.isFinite(filters.minRating)
  ) {
    const safeRating = Math.min(Math.max(filters.minRating, 0), 10);
    params['filters[rating][$gte]'] = String(safeRating);
  }

  let fromYear = filters.fromYear;
  let toYear = filters.toYear;

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
  if (fromYear !== undefined) {
    params['filters[year][$gte]'] = String(fromYear);
  }
  if (toYear !== undefined) {
    params['filters[year][$lte]'] = String(toYear);
  }

  let fromRuntime = filters.fromRuntime;
  let toRuntime = filters.toRuntime;

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
  if (fromRuntime !== undefined) {
    params['filters[runtime][$gte]'] = String(fromRuntime);
  }
  if (toRuntime !== undefined) {
    params['filters[runtime][$lte]'] = String(toRuntime);
  }

  const country = filters.country?.trim();
  if (country) {
    params['filters[country][$eq]'] = country;
  }

  return params;
}
