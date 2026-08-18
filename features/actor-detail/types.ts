// features/actor-detail/types.ts

import type { Actor, Movie } from '@/types';

export interface ActorDetailViewModel {
  actor: Actor;
  movies: Movie[];
  movieCount: number;
  hasMovies: boolean;
}