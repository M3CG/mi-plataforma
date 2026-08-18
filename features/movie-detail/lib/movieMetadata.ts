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
      title: 'Película no encontrada',
    };
  }

  const cleanSynopsis = viewModel.synopsis.trim();

  const description = cleanSynopsis
    ? truncate(cleanSynopsis, 150)
    : `Descubre ${viewModel.title} (${viewModel.year}) en CineStream. Película disponible en HD con múltiples servidores.`;

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