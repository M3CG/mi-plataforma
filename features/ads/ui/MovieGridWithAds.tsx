// features/ads/ui/MovieGridWithAds.tsx
'use client';

import type { Movie } from '@/types';
import type { MovieFilters } from '@/entities/movie/types/filters';
import { MovieGrid } from '@/features/catalog';
import MovieGridAdSlot from './MovieGridAdSlot';

interface MovieGridWithAdsProps {
  initialMovies: Movie[];
  initialHasMore: boolean;
  filters: MovieFilters;
}

export default function MovieGridWithAds({
  initialMovies,
  initialHasMore,
  filters,
}: MovieGridWithAdsProps) {
  return (
    <MovieGrid
      initialMovies={initialMovies}
      initialHasMore={initialHasMore}
      filters={filters}
      renderAfterMovie={(index) => <MovieGridAdSlot index={index} />}
    />
  );
}