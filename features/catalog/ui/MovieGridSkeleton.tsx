import { MovieCardSkeleton } from '@/widgets/movie-card';
import PosterGrid from '@/shared/ui/PosterGrid';

interface MovieGridSkeletonProps {
  count?: number;
}

export default function MovieGridSkeleton({
  count = 24,
}: MovieGridSkeletonProps) {
  return (
    <PosterGrid variant="compact">
      {Array.from({ length: count }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </PosterGrid>
  );
}
