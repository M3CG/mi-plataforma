// app/movies/loading.tsx

import { MovieGridSkeleton } from '@/features/catalog';

export default function MoviesLoading() {
  return (
    <main className="min-h-screen p-4 md:p-8 pt-24">
      <div className="flex gap-8 max-w-[1800px] mx-auto">
        <div className="flex-1 min-w-0">
          <div className="h-10 w-80 bg-white/5 rounded mb-6 animate-pulse"></div>
          <div className="h-32 bg-white/[0.03] rounded-xl mb-8 animate-pulse"></div>

          <MovieGridSkeleton count={24} />
        </div>

        <aside className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-24 h-[calc(100vh-8rem)] bg-white/[0.02] border border-dashed border-white/10 rounded-lg animate-pulse"></div>
        </aside>
      </div>
    </main>
  );
}
