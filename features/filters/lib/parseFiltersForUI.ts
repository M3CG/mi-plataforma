import {
  DEFAULT_MOVIE_SORT,
  type MovieSort,
} from '@/entities/movie';
import { parseMovieFiltersFromSearchParams } from '@/lib/url/movieFilters';
import { MOVIE_FILTER_PARAM_KEYS } from '@/lib/url/movieFilterParams';

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
  filterCount: number;
}

/**
* Parsea la URL y devuelve un estado listo para la UI.
*
* Esto elimina la duplicación que existía en useMovieFilters,
* donde se volvían a leer manualmente los mismos query params.
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

  const filterCount =
    activeGenres.length +
    (minRating ? 1 : 0) +
    (hasYearFilter ? 1 : 0) +
    (country ? 1 : 0);

  return {
    activeGenres,
    minRating,
    country,
    sort,
    fromYear,
    toYear,
    hasYearFilter,
    filterCount,
  };
}
