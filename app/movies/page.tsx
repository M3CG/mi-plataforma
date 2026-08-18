import type { MovieFiltersQuery } from '@/entities/movie';
import {
  MoviesPage,
  getMoviesPageData,
  buildMoviesPageMetadata,
} from '@/features/movies-page';
import { parseMovieFiltersFromRecord } from '@/lib/url/movieFilters';
import { AdBanner } from '@/features/ads';
import { CatalogGridWithAds } from '@/widgets/composition/catalog-grid-with-ads';

export const metadata = buildMoviesPageMetadata();

interface MoviesRouteProps {
  searchParams: Promise<MovieFiltersQuery>;
}

export default async function MoviesRoute({
  searchParams,
}: MoviesRouteProps) {
  const rawFilters = await searchParams;
  const filters = parseMovieFiltersFromRecord(rawFilters);
  const pageData = await getMoviesPageData(filters);

  return (
    <MoviesPage
      data={pageData}
      catalogSlot={
        <CatalogGridWithAds
          initialMovies={pageData.initialMovies}
          initialHasMore={pageData.initialHasMore}
          filters={pageData.filters}
        />
      }
      sidebarSlot={
        <aside className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-24 h-[calc(100vh-8rem)]">
            <AdBanner format="skyscraper" />
          </div>
        </aside>
      }
    />
  );
}
