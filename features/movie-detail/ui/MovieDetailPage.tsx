import type { ReactNode } from 'react';
import type { MovieDetailViewModel } from '../lib/createMovieDetailViewModel';
import { buildMovieJsonLdString } from '../lib/movieJsonLd';
import MovieHero from './MovieHero';
import MovieInfoSection from './MovieInfoSection';
import MovieCastSection from './MovieCastSection';

interface MovieDetailPageProps {
  viewModel: MovieDetailViewModel;
  playerSlot: ReactNode;
  afterPlayerSlot?: ReactNode;
}

export default function MovieDetailPage({
  viewModel,
  playerSlot,
  afterPlayerSlot,
}: MovieDetailPageProps) {
  const jsonLdString = buildMovieJsonLdString(viewModel);

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <MovieHero viewModel={viewModel} />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <MovieInfoSection viewModel={viewModel} />
        <MovieCastSection actors={viewModel.actors} />
        {playerSlot}
        {afterPlayerSlot}
      </div>
    </main>
  );
}
