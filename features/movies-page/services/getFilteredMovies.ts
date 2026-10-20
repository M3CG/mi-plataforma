// features/movies-page/services/getFilteredMovies.ts
import { cache } from 'react';
import type { MovieFilters } from '@/entities/movie/types/filters';
import type { Movie } from '@/entities/movie';
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination/config';
import { serializeMovieFiltersToSearchParams } from '@/lib/url/movieFilters';
import { discoverMovies } from '@/lib/api/tmdb/discover';
import { normalizeTmdbResultsToMovies } from '@/lib/api/tmdb/catalogNormalizer';

export interface FilteredMoviesResult {
  movies: Movie[];
  hasMore: boolean;
}

export const getFilteredMovies = cache(
  async (filters: MovieFilters): Promise<FilteredMoviesResult> => {
    const searchParams = serializeMovieFiltersToSearchParams(filters);
    const result = await discoverMovies(
      searchParams,
      1,
      'catalog',
      DEFAULT_PAGE_SIZE
    );
    const movies = normalizeTmdbResultsToMovies(result.results);
    return { movies, hasMore: result.hasMore };
  }
);
