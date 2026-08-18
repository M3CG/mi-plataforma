// features/search/domain/mergeSearchResults.ts

import type { Movie } from '@/types';
import { getMovieKey } from '@/entities/movie';
import {
  computeSearchScore,
  type SearchSource,
} from './scoring';

export interface SearchResultSet {
  movies: Movie[];
  source: SearchSource;
}

interface ScoredMovie {
  movie: Movie;
  score: number;
}

export function mergeSearchResults(
  resultSets: SearchResultSet[],
  normalizedQuery: string
): Movie[] {
  const mergedMap = new Map<string, ScoredMovie>();

  for (const resultSet of resultSets) {
    for (const movie of resultSet.movies) {
      const key = getMovieKey(movie);

      const score = computeSearchScore(
        movie,
        normalizedQuery,
        resultSet.source
      );

      const existing = mergedMap.get(key);

      if (!existing || score > existing.score) {
        mergedMap.set(key, {
          movie,
          score,
        });
      }
    }
  }

  return Array.from(mergedMap.values())
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const ratingA = a.movie.rating ?? 0;
      const ratingB = b.movie.rating ?? 0;

      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }

      const yearA = a.movie.year ?? 0;
      const yearB = b.movie.year ?? 0;

      if (yearB !== yearA) {
        return yearB - yearA;
      }

      return a.movie.title.localeCompare(b.movie.title);
    })
    .map((entry) => entry.movie);
}