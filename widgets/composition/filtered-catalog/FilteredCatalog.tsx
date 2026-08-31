import type { MovieFilters } from '@/entities/movie';
import { getFilteredMovies } from '@/features/movies-page/services/getFilteredMovies';
import MoviesEmptyState from '@/features/movies-page/ui/MoviesEmptyState';
import { CatalogGridWithAds } from '@/widgets/composition/catalog-grid-with-ads';

interface FilteredCatalogProps {
  filters: MovieFilters;
}

/**
 * Server component async que resuelve el grid del catálogo.
 *
 * Se consume dentro de un <Suspense> en app/movies/page.tsx con
 * `key={serializeFilters(filters)}`. Cuando los filtros cambian,
 * React desmonta este componente y muestra el fallback (skeleton)
 * mientras se monta una nueva instancia con los filtros nuevos.
 *
 * El FilterMenu queda fuera de este Suspense, así que mantiene
 * su estado visual durante toda la carga.
 */
export default async function FilteredCatalog({
  filters,
}: FilteredCatalogProps) {
  const { movies, hasMore } = await getFilteredMovies(filters);

  if (movies.length === 0) {
    return <MoviesEmptyState />;
  }

  return (
    <CatalogGridWithAds
      initialMovies={movies}
      initialHasMore={hasMore}
      filters={filters}
    />
  );
}
