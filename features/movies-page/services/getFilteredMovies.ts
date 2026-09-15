// features/movies-page/services/getFilteredMovies.ts
import { cache } from 'react';
import type { MovieFilters } from '@/entities/movie/types/filters';
import type { Movie } from '@/entities/movie';
import { serializeMovieFiltersToSearchParams } from '@/lib/url/movieFilters';
import { discoverMovies } from '@/lib/api/tmdb/discover';
import { normalizeTmdbResultsToMovies } from '@/lib/api/tmdb/catalogNormalizer';

export interface FilteredMoviesResult {
  movies: Movie[];
  hasMore: boolean;
}

/**
 * Fetch cacheado de películas filtradas desde TMDB.
 *
 * Cada combinación de filtros produce una clave distinta en la
 * cache de React, así que al cambiar los filtros se dispara un
 * nuevo fetch automáticamente.
 *
 * Ya NO consulta Strapi. Todo viene de TMDB Discover.
 */
export const getFilteredMovies = cache(
  async (filters: MovieFilters): Promise<FilteredMoviesResult> => {
    const searchParams = serializeMovieFiltersToSearchParams(filters);
    const result = await discoverMovies(searchParams, 1);
    const movies = normalizeTmdbResultsToMovies(result.results);
    return { movies, hasMore: result.hasMore };
  }
);