'use client';

import type { MouseEvent } from 'react';
import type { Movie } from '@/entities/movie';
import MovieCard from './MovieCard';
import { routes } from '@/lib/routes';

interface AppMovieCardProps {
  movie: Movie;
  onPrimaryLinkClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export default function AppMovieCard({
  movie,
  onPrimaryLinkClick,
}: AppMovieCardProps) {
  return (
    <MovieCard
      movie={movie}
      href={routes.movie(movie.slug)}
      getCategoryHref={(categorySlug) => routes.moviesByGenre(categorySlug)}
      onPrimaryLinkClick={onPrimaryLinkClick}
    />
  );
}
