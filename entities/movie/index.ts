export type { Movie, Server } from './types/movie';

export { createMovieCardViewModel } from './lib/createMovieCardViewModel';
export type { MovieCardViewModel } from './lib/createMovieCardViewModel';

export { getMovieKey, dedupeMovies } from './lib/movieKey';

export type {
  MovieFilters,
  MovieFiltersQuery,
  MovieSort,
} from './types/filters';

export {
  MOVIE_SORT_VALUES,
  DEFAULT_MOVIE_SORT,
  MOVIE_SORT_OPTIONS,
  isMovieSort,
} from './config/sort';

export type { MovieSortOption } from './config/sort';

export {
  MOVIE_YEAR_MIN,
  getMovieYearMax,
  clampMovieYear,
} from './lib/year';

export {
  MOVIE_FILTER_PARAM_KEYS,
  MOVIE_PAGINATION_PARAM_KEYS,
} from './config/filterParams';

export type { MovieFilterParamKey } from './config/filterParams';
