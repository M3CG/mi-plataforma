// features/actor-detail/types.ts

import type { Actor } from '@/entities/person';
import type { Movie } from '@/entities/movie';

export interface ActorDetailViewModel {
  actor: Actor;
  movies: Movie[];
  movieCount: number;
  hasMovies: boolean;
}