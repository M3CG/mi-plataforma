import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { AppMovieCard } from '@/widgets/movie-card';
import PosterGrid from '@/shared/ui/PosterGrid';
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

      <PosterGrid variant="compact">
        {movies.map((movie) => (
          <AppMovieCard
            key={getMovieKey(movie)}
            movie={movie}
          />
        ))}
      </PosterGrid>
    </>
  );
}
