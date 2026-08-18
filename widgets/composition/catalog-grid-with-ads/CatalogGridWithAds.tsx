'use client';

import type { Movie, MovieFilters } from '@/entities/movie';
import { MovieGrid } from '@/features/catalog';
import { MovieGridAdSlot } from '@/features/ads';

interface CatalogGridWithAdsProps {
  initialMovies: Movie[];
  initialHasMore: boolean;
  filters: MovieFilters;
}

export default function CatalogGridWithAds({
  initialMovies,
  initialHasMore,
  filters,
}: CatalogGridWithAdsProps) {
  return (
    <MovieGrid
      initialMovies={initialMovies}
      initialHasMore={initialHasMore}
      filters={filters}
      renderAfterMovie={(index) => <MovieGridAdSlot index={index} />}
    />
  );
}
