// features/actor-detail/lib/createActorDetailViewModel.ts

import type { Actor, Movie } from '@/types';
import type { ActorDetailViewModel } from '../types';

export function createActorDetailViewModel(
  actor: Actor,
  movies: Movie[]
): ActorDetailViewModel {
  return {
    actor,
    movies,
    movieCount: movies.length,
    hasMovies: movies.length > 0,
  };
}