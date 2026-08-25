import { notFound } from 'next/navigation';
import {
  MovieDetailPage,
  ViewTracker,
  getMovieDetailPage,
  buildMovieMetadata,
} from '@/features/movie-detail';
import { MoviePlayerSection } from '@/widgets/composition/movie-player';
import { AdBanner } from '@/features/ads';

interface MovieDetailRouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: MovieDetailRouteParams) {
  const { slug } = await params;
  const viewModel = await getMovieDetailPage(slug);
  return buildMovieMetadata(viewModel);
}

export default async function MovieDetailRoute({
  params,
}: MovieDetailRouteParams) {
  const { slug } = await params;
  const viewModel = await getMovieDetailPage(slug);

  if (!viewModel) {
    notFound();
  }

  return (
    <>
      <ViewTracker slug={viewModel.slug} />
      <MovieDetailPage
        viewModel={viewModel}
        playerSlot={
          <MoviePlayerSection
            movieSlug={viewModel.slug}
            tmdbId={viewModel.tmdbId}
            servers={viewModel.servers}
          />
        }
        afterPlayerSlot={<AdBanner format="horizontal" />}
      />
    </>
  );
}
