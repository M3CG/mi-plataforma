// features/player/lib/createMovieSources.ts

import type { Server } from '@/types';
import type { PlayableSource } from '../types';
import { EMBED_PROVIDERS } from '../config/providers';

interface CreateMovieSourcesParams {
  tmdbId?: number;
  manualServers?: Server[];
}

export function createMovieSources({
  tmdbId,
  manualServers = [],
}: CreateMovieSourcesParams): PlayableSource[] {
  const dynamicSources: PlayableSource[] = tmdbId
    ? EMBED_PROVIDERS.map((provider) => ({
        id: `dynamic-${provider.name}`,
        name: provider.name,
        url: `${provider.baseUrl}${tmdbId}`,
        sandbox: provider.sandbox,
      }))
    : [];

  const manualSources: PlayableSource[] = manualServers.map((server) => ({
    id: `manual-${server.id}`,
    name: server.name,
    url: server.url,
  }));

  return [...dynamicSources, ...manualSources];
}