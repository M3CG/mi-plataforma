import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { AppMovieCard } from '@/widgets/movie-card';
import PosterGrid from '@/shared/ui/PosterGrid';

interface SearchResultsProps {
  results: Movie[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  return (
    <PosterGrid variant="spacious">
      {results.map((movie) => (
        <AppMovieCard
          key={getMovieKey(movie)}
          movie={movie}
        />
      ))}
    </PosterGrid>
  );
}
