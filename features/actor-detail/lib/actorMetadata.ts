// features/actor-detail/lib/actorMetadata.ts

import type { Metadata } from 'next';
import type { ActorDetailViewModel } from '../types';

export function buildActorMetadata(
  viewModel: ActorDetailViewModel | null
): Metadata {
  if (!viewModel) {
    return {
      title: 'Actor no encontrado',
    };
  }

  const { actor } = viewModel;

  return {
    title: `${actor.name} | CineStream`,
    description: `Descubre todas las películas de ${actor.name} en CineStream. Filmografía completa en HD.`,
    openGraph: {
      title: `${actor.name} | CineStream`,
      description: `Descubre todas las películas de ${actor.name} en CineStream.`,
      images: actor.profile_image_url
        ? [actor.profile_image_url]
        : [],
    },
    twitter: {
      card: 'summary',
      title: `${actor.name} | CineStream`,
      description: `Descubre todas las películas de ${actor.name} en CineStream.`,
      images: actor.profile_image_url
        ? [actor.profile_image_url]
        : [],
    },
  };
}