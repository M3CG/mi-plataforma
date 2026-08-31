// features/movies-page/ui/MoviesEmptyState.tsx

import Link from 'next/link';
import { IconRefresh, IconSearch } from '@/shared/ui/icons';
import { routes } from '@/lib/routes';

export default function MoviesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
        <IconSearch className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-1">
        No results
      </h3>
      <p className="text-sm text-gray-400 mb-6 max-w-sm">
        No movies match the selected filters. Try
        different criteria.
      </p>
      <Link
        href={routes.movies}
        className="
          inline-flex items-center gap-2
          bg-white/5 border border-white/10
          hover:bg-white/10
          text-gray-300 hover:text-white
          px-4 py-2 rounded-full
          text-sm font-medium
          transition-all
        "
      >
        <IconRefresh />
        Clear filters
      </Link>
    </div>
  );
}