import { HomePage, getHomePageData } from '@/features/home';
import { AdBanner } from '@/features/ads';

export default async function Home() {
  const data = await getHomePageData();

  return (
    <HomePage
      movies={data.movies}
      afterTrendingSlot={<AdBanner format="horizontal" />}
    />
  );
}
