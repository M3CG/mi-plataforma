// features/movie-detail/lib/movieMetadata.ts
import type { Metadata } from 'next';
import type { MovieDetailViewModel } from './createMovieDetailViewModel';

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export function buildMovieMetadata(
  viewModel: MovieDetailViewModel | null
): Metadata {
  if (!viewModel) {
    return {
      title: 'Movie not found',
    };
  }
  const cleanSynopsis = viewModel.synopsis.trim();
  const description = cleanSynopsis
    ? truncate(cleanSynopsis, 150)
    : `Watch ${viewModel.title} (${viewModel.year}) on CineStream. Available in HD with multiple servers.`;
  const images = viewModel.posterUrl ? [viewModel.posterUrl] : [];
  return {
    title: `${viewModel.title} (${viewModel.year}) | CineStream`,
    description,
    openGraph: {
      title: `${viewModel.title} (${viewModel.year})`,
      description,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${viewModel.title} (${viewModel.year})`,
      description,
      images,
    },
  };
}
