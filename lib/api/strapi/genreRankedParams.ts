// lib/api/strapi/genreRankedParams.ts
/**
 * Nombres de query params que espera el endpoint custom
 * GET /movies/genre-ranked de Strapi.
 *
 * Estos NO son los query params de la URL del frontend.
 * Son la interfaz del endpoint custom del backend.
 *
 * El BFF (/api/movies) recibe params del frontend
 * (definidos en lib/url/movieFilterParams.ts) y los
 * traduce a estos nombres para llamar al endpoint custom.
 *
 * IMPORTANTE: mantener esto sincronizado con lo que el
 * backend parsea en backend/src/api/movie/services/movie.ts
 * (función findGenreRanked).
 */
export const GENRE_RANKED_PARAM_KEYS = {
  genres: 'genres',
  minRating: 'minRating',
  fromYear: 'fromYear',
  toYear: 'toYear',
  fromRuntime: 'fromRuntime',
  toRuntime: 'toRuntime',
  country: 'country',
  sort: 'sort',
} as const;

export const GENRE_RANKED_PAGINATION_KEYS = {
  page: 'page',
  pageSize: 'pageSize',
} as const;
