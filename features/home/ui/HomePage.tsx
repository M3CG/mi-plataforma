import type { ReactNode } from 'react';
import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { AppMovieCard } from '@/widgets/movie-card';

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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.map((movie) => (
          <AppMovieCard
            key={getMovieKey(movie)}
            movie={movie}
          />
        ))}
      </div>

      {afterTrendingSlot}
    </main>
  );
}
