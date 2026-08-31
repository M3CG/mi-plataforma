// app/search/loading.tsx

import { MovieGridSkeleton } from '@/features/catalog';

export default function SearchLoading() {
  return (
    <main className="min-h-screen p-8">
      <div className="h-10 w-96 bg-gray-800 rounded mb-6 animate-pulse"></div>

      <MovieGridSkeleton count={12} />
    </main>
  );
}