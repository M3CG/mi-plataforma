import { Suspense } from 'react';
import HeroWithTicker from './HeroWithTicker';
import MovieStrip from './MovieStrip';
import CatalogCta from './CatalogCta';
import HomeStripsSkeleton from './HomeStripsSkeleton';
import { getHomeRankingsData } from '../services/getHomePageData';
import type { HomeHeroData } from '../types';

interface HomePageProps {
  data: HomeHeroData;
}

async function HomeRankingsSection() {
  const { mostViewedMovies, bestOfAllTimeMovies } =
    await getHomeRankingsData();
  return (
    <>
      <MovieStrip title="Most Watched" movies={mostViewedMovies} />
      <MovieStrip
        title="Best of All Time"
        movies={bestOfAllTimeMovies}
      />
    </>
  );
}

export default function HomePage({ data }: HomePageProps) {
  const { heroMovies, latestMovies } = data;
  return (
    <main className="min-h-screen">
      <HeroWithTicker movies={heroMovies} />
      <div
        className="
          max-w-[1600px] mx-auto
          px-6 md:px-10 lg:px-14
          pt-14 md:pt-20 pb-16
          space-y-16 md:space-y-24
        "
      >
        <MovieStrip title="New Arrivals" movies={latestMovies} />
        <Suspense fallback={<HomeStripsSkeleton />}>
          <HomeRankingsSection />
        </Suspense>
        <CatalogCta />
      </div>
    </main>
  );
}
