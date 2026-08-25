import { HomePage, getHomePageData } from '@/features/home';

export default async function Home() {
  const data = await getHomePageData();
  return <HomePage data={data} />;
}
