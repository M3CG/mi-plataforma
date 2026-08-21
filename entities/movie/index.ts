export type { Movie, Server } from './types/movie';

export { getMovieKey, dedupeMovies } from './lib/movieKey';

export type {
  MovieFilters,
  MovieFiltersQuery,
  MovieSort,
} from './types/filters';

export {
  MOVIE_SORT_VALUES,
  DEFAULT_MOVIE_SORT,
  isMovieSort,
} from './config/sort';

export {
  MOVIE_YEAR_MIN,
  getMovieYearMax,
  clampMovieYear,
} from './lib/year';

export {
  MOVIE_RUNTIME_MIN,
  MOVIE_RUNTIME_MAX,
  clampMovieRuntime,
} from './lib/runtime';

export {
  shouldUseGenreMatchRanking,
  getMovieGenreMatchCount,
  rankMoviesByGenreMatch,
} from './lib/genreMatch';

export { formatRuntime } from './lib/format';
