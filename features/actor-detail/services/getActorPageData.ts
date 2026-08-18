// features/actor-detail/services/getActorPageData.ts
import { cache } from 'react';

import {
  getActorBySlug,
  getMoviesByActor,
} from '@/lib/queries/actors';

import { isValidSlug } from '@/lib/utils/slugify';

import type { ActorDetailViewModel } from '../types';
import { createActorDetailViewModel } from '../lib/createActorDetailViewModel';

export const getActorPageData = cache(
  async (
    slug: string
  ): Promise<ActorDetailViewModel | null> => {
    if (!isValidSlug(slug)) {
      return null;
    }

    const [actor, moviesData] = await Promise.all([
      getActorBySlug(slug),
      getMoviesByActor(slug),
    ]);

    if (!actor) {
      return null;
    }

    return createActorDetailViewModel(actor, moviesData.data);
  }
);