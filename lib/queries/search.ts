import { cache } from 'react';
import {
  movieSearchRepository,
  type MovieSearchRepository,
} from '@/lib/api/repositories/movieSearch';

const searchUnified = cache(async (query: string, limit: number) =>
  movieSearchRepository.searchUnified(query, limit)
);

export const movieSearchQueries: MovieSearchRepository = {
  searchUnified,
};

export type { MovieSearchRepository };
