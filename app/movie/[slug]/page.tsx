// app/movie/[slug]/page.tsx
import { notFound } from 'next/navigation';
import {
  MovieDetailPage,
  getMovieDetailPage,
  buildMovieMetadata,
} from '@/features/movie-detail';
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
    <MovieDetailPage
      viewModel={viewModel}
      afterPlayerSlot={<AdBanner format="horizontal" />}
    />
  );
}