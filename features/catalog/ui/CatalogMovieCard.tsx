'use client';

import type { MouseEvent } from 'react';
import type { Movie } from '@/entities/movie';
import { AppMovieCard } from '@/widgets/movie-card';
import { saveGridScrollPosition } from '../lib/gridScrollPersistence';
import { routes } from '@/lib/routes';

interface CatalogMovieCardProps {
  movie: Movie;
  highlightedGenres?: string[];
}

export default function CatalogMovieCard({
  movie,
  highlightedGenres,
}: CatalogMovieCardProps) {
  const handlePrimaryLinkClick = (
    event: MouseEvent<HTMLAnchorElement>
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    saveGridScrollPosition(routes.movies);
  };

  return (
    <AppMovieCard
      movie={movie}
      onPrimaryLinkClick={handlePrimaryLinkClick}
      highlightedCategorySlugs={highlightedGenres}
    />
  );
}
