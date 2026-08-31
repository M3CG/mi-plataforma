import { HomePage, getHomeHeroData } from '@/features/home';

export default async function Home() {
  const data = await getHomeHeroData();
  return <HomePage data={data} />;
}
