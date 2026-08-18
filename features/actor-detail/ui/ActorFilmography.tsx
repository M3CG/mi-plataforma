// features/actor-detail/ui/ActorFilmography.tsx
import type { Movie } from '@/types';
import { getMovieKey } from '@/entities/movie';
import AppMovieCard from '@/widgets/MovieCard/AppMovieCard';
import ActorEmptyState from './ActorEmptyState';

interface ActorFilmographyProps {
  movies: Movie[];
  actorName: string;
}

export default function ActorFilmography({
  movies,
  actorName,
}: ActorFilmographyProps) {
  if (!movies || movies.length === 0) {
    return <ActorEmptyState actorName={actorName} />;
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-white mb-6">
        Filmografía
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {movies.map((movie) => (
          <AppMovieCard
            key={getMovieKey(movie)}
            movie={movie}
          />
        ))}
      </div>
    </>
  );
}