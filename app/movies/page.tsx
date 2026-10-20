import type { MovieFiltersQuery } from '@/entities/movie';
import {
  FilterMenuSkeleton,
  CatalogSkeleton,
  buildMoviesPageMetadata,
  getFilterOptions,
} from '@/features/movies-page';
import { FilteredCatalog } from '@/widgets/composition/filtered-catalog';
import { FilterMenu } from '@/features/filters';
import {
  parseMovieFiltersFromRecord,
  serializeMovieFiltersToSearchParams,
} from '@/lib/url/movieFilters';
import { AdBanner, ADS_ENABLED } from '@/features/ads';
import { Suspense } from 'react';

export const metadata = buildMoviesPageMetadata();

interface MoviesRouteProps {
  searchParams: Promise<MovieFiltersQuery>;
}

export default async function MoviesRoute({
  searchParams,
}: MoviesRouteProps) {
  const [rawFilters, { categories, countries }] = await Promise.all([
    searchParams,
    getFilterOptions(),
  ]);

  const filters = parseMovieFiltersFromRecord(rawFilters);
  const filterKey = serializeMovieFiltersToSearchParams(filters).toString();

  return (
    <main className="min-h-screen px-4 md:px-8 pb-12 pt-6">
      <div className="flex gap-8 max-w-[2200px] mx-auto">
        <div className="flex-1 min-w-0">
          <h1 className="sr-only">Movie Catalog</h1>
          <Suspense fallback={<FilterMenuSkeleton />}>
            <FilterMenu categories={categories} countries={countries} />
          </Suspense>

          <Suspense key={filterKey} fallback={<CatalogSkeleton />}>
            <FilteredCatalog filters={filters} />
          </Suspense>
        </div>

        {ADS_ENABLED ? (
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-24 h-[calc(100vh-8rem)]">
              <AdBanner format="skyscraper" />
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
