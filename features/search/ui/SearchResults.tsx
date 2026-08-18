import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { AppMovieCard } from '@/widgets/movie-card';

interface SearchResultsProps {
  results: Movie[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {results.map((movie) => (
        <AppMovieCard
          key={getMovieKey(movie)}
          movie={movie}
        />
      ))}
    </div>
  );
}
