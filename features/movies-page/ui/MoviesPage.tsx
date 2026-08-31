import { Suspense, type ReactNode } from 'react';
import type { MoviesPageData } from '../types';
import MoviesResults from './MoviesResults';

interface MoviesPageProps {
  data: MoviesPageData;
  filtersSlot: ReactNode;
  filtersFallback: ReactNode;
  catalogSlot: ReactNode;
  sidebarSlot?: ReactNode;
}

export default function MoviesPage({
  data,
  filtersSlot,
  filtersFallback,
  catalogSlot,
  sidebarSlot,
}: MoviesPageProps) {
  return (
    <main className="min-h-screen px-4 md:px-8 pb-12 pt-6">
      <div className="flex gap-8 max-w-[2200px] mx-auto">
        <div className="flex-1 min-w-0">
          <h1 className="sr-only">Catálogo de Películas</h1>
          <Suspense fallback={filtersFallback}>
            {filtersSlot}
          </Suspense>
          <MoviesResults data={data} catalogSlot={catalogSlot} />
        </div>
        {sidebarSlot}
      </div>
    </main>
  );
}