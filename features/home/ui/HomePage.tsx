import type { HomePageData } from '../types';
import HeroSection from './HeroSection';
import MovieRow from './MovieRow';
import { routes } from '@/lib/routes';

interface HomePageProps {
  data: HomePageData;
}

export default function HomePage({ data }: HomePageProps) {
  const {
    heroMovie,
    latestMovies,
    mostViewedMovies,
    bestOfAllTimeMovies,
    genreRows,
  } = data;

  return (
    <main className="min-h-screen">
      {heroMovie && <HeroSection movie={heroMovie} />}

      <div className="relative z-10 space-y-12 py-12">
        {latestMovies.length > 0 && (
          <MovieRow
            title="Recién llegadas"
            movies={latestMovies}
            linkHref={routes.movies}
            linkLabel="Ver todo"
          />
        )}

        {mostViewedMovies.length > 0 && (
          <MovieRow
            title="Las más vistas"
            movies={mostViewedMovies}
            linkHref={routes.movies}
            linkLabel="Ver todo"
          />
        )}

        {genreRows.map((row) => (
          <MovieRow
            key={row.category.id}
            title={`Lo mejor de ${row.category.name}`}
            movies={row.movies}
            linkHref={routes.moviesByGenre(row.category.slug)}
            linkLabel="Ver todo"
          />
        ))}

        {bestOfAllTimeMovies.length > 0 && (
          <MovieRow
            title="Las mejores de todos los tiempos"
            movies={bestOfAllTimeMovies.slice(0, 10)}
            showRank
            linkHref={routes.movies}
            linkLabel="Ver todo"
          />
        )}
      </div>
    </main>
  );
}
