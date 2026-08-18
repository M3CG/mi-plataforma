// features/movies-page/ui/MoviesResults.tsx
import type { ReactNode } from 'react';
import type { MoviesPageData } from '../types';
import MoviesEmptyState from './MoviesEmptyState';

interface MoviesResultsProps {
  data: MoviesPageData;
  catalogSlot: ReactNode;
}

export default function MoviesResults({
  data,
  catalogSlot,
}: MoviesResultsProps) {
  if (!data.hasResults) {
    return <MoviesEmptyState />;
  }

  return <>{catalogSlot}</>;
}