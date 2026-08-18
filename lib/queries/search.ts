import { cache } from 'react';
import {
  movieSearchRepository,
  type MovieSearchRepository,
} from '@/lib/api/repositories/movieSearch';

const byTitle = cache(async (query: string, limit: number) =>
  movieSearchRepository.byTitle(query, limit)
);

const byActor = cache(async (query: string, limit: number) =>
  movieSearchRepository.byActor(query, limit)
);

const byDirector = cache(async (query: string, limit: number) =>
  movieSearchRepository.byDirector(query, limit)
);

const byCategory = cache(async (query: string, limit: number) =>
  movieSearchRepository.byCategory(query, limit)
);

export const movieSearchQueries: MovieSearchRepository = {
  byTitle,
  byActor,
  byDirector,
  byCategory,
};

export type { MovieSearchRepository };
