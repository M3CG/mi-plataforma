// features/movie-detail/lib/movieJsonLd.ts

import type { MovieDetailViewModel } from './createMovieDetailViewModel';
import { absoluteRoutes } from '@/lib/routes';

export function buildMovieJsonLd(viewModel: MovieDetailViewModel) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: viewModel.title,
    description: viewModel.synopsis || undefined,
    datePublished: viewModel.year
      ? `${viewModel.year}-01-01`
      : undefined,
    duration: viewModel.runtimeMinutes
      ? `PT${viewModel.runtimeMinutes}M`
      : undefined,
    countryOfOrigin: viewModel.country || undefined,
    contentRating: viewModel.ageRating || undefined,
    inLanguage: viewModel.originalLanguage || undefined,
    image: viewModel.posterUrl || undefined,
    url: absoluteRoutes.movie(viewModel.slug),
    actor:
      viewModel.actors.length > 0
        ? viewModel.actors.map((actor) => ({
            '@type': 'Person',
            name: actor.name,
            url: absoluteRoutes.actor(actor.slug),
          }))
        : undefined,
    director:
      viewModel.directors.length > 0
        ? viewModel.directors.map((director) => ({
            '@type': 'Person',
            name: director.name,
          }))
        : undefined,
    aggregateRating:
      viewModel.rating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: viewModel.rating,
            bestRating: 10,
            worstRating: 0,
            ratingCount: Math.max(1, Math.round(viewModel.rating * 100)),
          }
        : undefined,
  };
}

export function buildMovieJsonLdString(
  viewModel: MovieDetailViewModel
): string {
  return JSON.stringify(buildMovieJsonLd(viewModel)).replace(
    /</g,
    '\\u003c'
  );
}