import type { ReactNode } from 'react';
import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { AppMovieCard } from '@/widgets/movie-card';
import PosterGrid from '@/shared/ui/PosterGrid';

interface HomePageProps {
  movies: Movie[];
  afterTrendingSlot?: ReactNode;
}

export default function HomePage({
  movies,
  afterTrendingSlot,
}: HomePageProps) {
  return (
    <main className="min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Trending Now
      </h2>

      <PosterGrid variant="spacious">
        {movies.map((movie) => (
          <AppMovieCard
            key={getMovieKey(movie)}
            movie={movie}
          />
        ))}
      </PosterGrid>

      {afterTrendingSlot}
    </main>
  );
}
