// app/search/page.tsx
import {
  SearchPage,
  getSearchPageData,
  buildSearchMetadata,
} from '@/features/search';
import { AdBanner } from '@/features/ads';

interface SearchRouteProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export async function generateMetadata({
  searchParams,
}: SearchRouteProps) {
  const { q } = await searchParams;
  return buildSearchMetadata(q);
}

export default async function SearchRoute({
  searchParams,
}: SearchRouteProps) {
  const { q } = await searchParams;
  const pageData = await getSearchPageData(q);

  return (
    <SearchPage
      data={pageData}
      afterResultsSlot={<AdBanner format="horizontal" />}
    />
  );
}