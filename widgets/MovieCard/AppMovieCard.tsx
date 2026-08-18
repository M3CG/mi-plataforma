// components/AppMovieCard.tsx
'use client';

import type { Movie } from '@/types';
import MovieCard from '@/entities/movie/ui/MovieCard';
import { routes } from '@/lib/routes';

interface AppMovieCardProps {
  movie: Movie;
}

export default function AppMovieCard({ movie }: AppMovieCardProps) {
  return (
    <MovieCard
      movie={movie}
      href={routes.movie(movie.slug)}
      getCategoryHref={(categorySlug) =>
        routes.moviesByGenre(categorySlug)
      }
    />
  );
}