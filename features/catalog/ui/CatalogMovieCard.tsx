// features/catalog/ui/CatalogMovieCard.tsx
'use client';

import type { Movie } from '@/types';
import AppMovieCard from '@/widgets/MovieCard/AppMovieCard';
import { saveGridScrollPosition } from '../lib/gridScrollPersistence';

interface CatalogMovieCardProps {
  movie: Movie;
}

export default function CatalogMovieCard({ movie }: CatalogMovieCardProps) {
  return (
    <div onClickCapture={saveGridScrollPosition}>
      <AppMovieCard movie={movie} />
    </div>
  );
}