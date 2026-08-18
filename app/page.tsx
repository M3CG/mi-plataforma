// app/page.tsx
import { getHomeMovies } from '@/lib/queries/movies';
import { AdBanner } from '@/features/ads';
import { getMovieKey } from '@/entities/movie';
import AppMovieCard from '@/widgets/MovieCard/AppMovieCard';

export default async function Home() {
  const movies = await getHomeMovies();

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
      <AdBanner format="horizontal" />
    </main>
  );
}