// features/catalog/ui/MovieGridSkeleton.tsx

import MovieCardSkeleton from '@/entities/movie/ui/MovieCardSkeleton';

interface MovieGridSkeletonProps {
  count?: number;
}

export default function MovieGridSkeleton({
  count = 24,
}: MovieGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );
}