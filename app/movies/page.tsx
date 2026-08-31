import type { MovieFiltersQuery } from '@/entities/movie';
import {
  FilterMenuSkeleton,
  CatalogSkeleton,

  buildMoviesPageMetadata,
  getFilterOptions,
} from '@/features/movies-page';
import { FilteredCatalog } from '@/widgets/composition/filtered-catalog';
import { FilterMenu } from '@/features/filters';
import { parseMovieFiltersFromRecord } from '@/lib/url/movieFilters';
import { serializeMovieFiltersToSearchParams } from '@/lib/url/movieFilters';
import { AdBanner, ADS_ENABLED } from '@/features/ads';
import { Suspense } from 'react';

export const metadata = buildMoviesPageMetadata();

interface MoviesRouteProps {
  searchParams: Promise<MovieFiltersQuery>;
}

/**
 * Ruta de catálogo con Suspense granular.
 *
 * Flujo:
 * 1. Se esperan las opciones de filtros (cacheadas: 1 sola query
 *    al arranque, no depende de los filtros del usuario).
 * 2. Se parsean los filtros de la URL.
 * 3. El FilterMenu se renderiza de forma síncrona: nunca se
 *    desmonta ni se recarga al cambiar filtros.
 * 4. El grid va dentro de un <Suspense> con `key={filterKey}`.
 *    Cuando los filtros cambian, React desmonta el componente
 *    async interno y muestra el CatalogSkeleton hasta que el
 *    nuevo fetch resuelva.
 *
 * Resultado: el usuario ve el skeleton inmediatamente al aplicar
 * un filtro, sin que el menú "parpadee" ni pierda su estado.
 */
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
          <h1 className="sr-only">Catálogo de Películas</h1>
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
