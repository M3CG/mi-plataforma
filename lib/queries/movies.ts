// lib/queries/movies.ts
import { cache } from 'react';

import {
  fetchHomeMovies,
  fetchMovieBySlug,
  fetchMoviesWithFilters,
} from '@/lib/api/repositories/movies';

/**
 * Punto de entrada cacheado para server components.
 *
 * Las páginas no deben importar directamente repositories
 * cuando están dentro del render de React.
 */
export const getHomeMovies = cache(fetchHomeMovies);
export const getMovieBySlug = cache(fetchMovieBySlug);
export const getMoviesWithFilters = cache(fetchMoviesWithFilters);