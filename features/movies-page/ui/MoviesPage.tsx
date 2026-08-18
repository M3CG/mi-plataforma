// features/movies-page/ui/MoviesPage.tsx

import { Suspense, type ReactNode } from 'react';
import { FilterMenu } from '@/features/filters';
import type { MoviesPageData } from '../types';

import MoviesHeader from './MoviesHeader';
import MoviesResults from './MoviesResults';
import FilterMenuSkeleton from './FilterMenuSkeleton';

interface MoviesPageProps {
  data: MoviesPageData;
  catalogSlot: ReactNode;
  sidebarSlot?: ReactNode;
}

export default function MoviesPage({
  data,
  catalogSlot,
  sidebarSlot,
}: MoviesPageProps) {
  return (
    <main className="min-h-screen px-4 md:px-8 pb-12 pt-6">
      <div className="flex gap-8 max-w-[1800px] mx-auto">
        {/* ─── Columna izquierda: contenido principal ─── */}
        <div className="flex-1 min-w-0">
          <MoviesHeader hasResults={data.hasResults} />

          <Suspense fallback={<FilterMenuSkeleton />}>
            <FilterMenu
              categories={data.categories}
              countries={data.countries}
            />
          </Suspense>

          <MoviesResults data={data} catalogSlot={catalogSlot} />
        </div>

        {/* ─── Columna derecha: slot de composición ─── */}
        {sidebarSlot}
      </div>
    </main>
  );
}