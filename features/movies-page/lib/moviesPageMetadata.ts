// features/movies-page/lib/moviesPageMetadata.ts
import type { Metadata } from 'next';

export function buildMoviesPageMetadata(): Metadata {
  return {
    title: 'Movie Catalog | CineStream',
    description:
      'Browse the full CineStream catalog. Filter movies by genre, year, rating and country.',
    openGraph: {
      title: 'Movie Catalog | CineStream',
      description:
        'Browse the full CineStream catalog. Filter movies by genre, year, rating and country.',
    },
    twitter: {
      card: 'summary',
      title: 'Movie Catalog | CineStream',
      description:
        'Browse the full CineStream catalog. Filter movies by genre, year, rating and country.',
    },
  };
}
