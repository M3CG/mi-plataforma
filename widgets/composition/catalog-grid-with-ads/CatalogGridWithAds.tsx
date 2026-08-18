'use client';

import type { Movie, MovieFilters } from '@/entities/movie';
import { MovieGrid, CatalogMovieCard } from '@/features/catalog';
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
      renderMovie={(movie) => <CatalogMovieCard movie={movie} />}
      renderAfterMovie={(index) => <MovieGridAdSlot index={index} />}
    />
  );
}
