// features/actor-detail/ui/ActorPage.tsx

import type { ActorDetailViewModel } from '../types';

import ActorHero from './ActorHero';
import ActorFilmography from './ActorFilmography';

interface ActorPageProps {
  viewModel: ActorDetailViewModel;
}

export default function ActorPage({ viewModel }: ActorPageProps) {
  return (
    <main className="min-h-screen">
      <ActorHero viewModel={viewModel} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <ActorFilmography
          movies={viewModel.movies}
          actorName={viewModel.actor.name}
        />
      </div>
    </main>
  );
}