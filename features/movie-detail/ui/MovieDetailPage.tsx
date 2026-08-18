// features/movie-detail/ui/MovieDetailPage.tsx
import type { ReactNode } from 'react';
import type { MovieDetailViewModel } from '../lib/createMovieDetailViewModel';
import { buildMovieJsonLdString } from '../lib/movieJsonLd';

import MovieHero from './MovieHero';
import MovieInfoSection from './MovieInfoSection';
import MovieCastSection from './MovieCastSection';
import MoviePlayerSection from './MoviePlayerSection';

interface MovieDetailPageProps {
  viewModel: MovieDetailViewModel;
  afterPlayerSlot?: ReactNode;
}

export default function MovieDetailPage({
  viewModel,
  afterPlayerSlot,
}: MovieDetailPageProps) {
  const jsonLdString = buildMovieJsonLdString(viewModel);

  return (
    <main className="min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />

      {/* Hero */}
      <MovieHero viewModel={viewModel} />

      {/* Cuerpo */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <MovieInfoSection viewModel={viewModel} />
        <MovieCastSection actors={viewModel.actors} />
        <MoviePlayerSection
          movieSlug={viewModel.slug}
          tmdbId={viewModel.tmdbId}
          servers={viewModel.servers}
        />

        {afterPlayerSlot}
      </div>
    </main>
  );
}