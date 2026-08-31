import type { HomePageData } from '../types';
import HeroSection from './HeroSection';
import TopViewedList from './TopViewedList';
import LatestArrivals from './LatestArrivals';
import CatalogCta from './CatalogCta';

interface HomePageProps {
  data: HomePageData;
}

/**
 * Home como cartelera curada:
 * hero editorial + ranking numerado + tira minimalista + CTA.
 * Menos películas, más intención.
 */
export default function HomePage({ data }: HomePageProps) {
  const { heroMovie, latestMovies, mostViewedMovies } = data;

  return (
    <main className="min-h-screen">
      {heroMovie && <HeroSection movie={heroMovie} />}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-14 md:pt-20 pb-16 space-y-14 md:space-y-20">
        <TopViewedList movies={mostViewedMovies} />
        <LatestArrivals movies={latestMovies} />
        <CatalogCta />
      </div>
    </main>
  );
}
