// lib/queries/actors.ts
import { cache } from 'react';

import {
  fetchActorBySlug,
  fetchMoviesByActor,
} from '@/lib/api/repositories/actors';

export const getActorBySlug = cache(fetchActorBySlug);
export const getMoviesByActor = cache(fetchMoviesByActor);