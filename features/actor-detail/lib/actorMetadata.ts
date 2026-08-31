// features/actor-detail/lib/actorMetadata.ts
import type { Metadata } from 'next';
import type { ActorDetailViewModel } from '../types';

export function buildActorMetadata(
  viewModel: ActorDetailViewModel | null
): Metadata {
  if (!viewModel) {
    return {
      title: 'Actor not found',
    };
  }
  const { actor } = viewModel;
  return {
    title: `${actor.name} | CineStream`,
    description: `Discover all movies starring ${actor.name} on CineStream. Complete filmography in HD.`,
    openGraph: {
      title: `${actor.name} | CineStream`,
      description: `Discover all movies starring ${actor.name} on CineStream.`,
      images: actor.profile_image_url
        ? [actor.profile_image_url]
        : [],
    },
    twitter: {
      card: 'summary',
      title: `${actor.name} | CineStream`,
      description: `Discover all movies starring ${actor.name} on CineStream.`,
      images: actor.profile_image_url
        ? [actor.profile_image_url]
        : [],
    },
  };
}
