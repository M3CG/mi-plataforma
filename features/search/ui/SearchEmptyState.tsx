// features/search/ui/SearchEmptyState.tsx

import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function SearchEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h3 className="text-lg font-semibold text-gray-200 mb-1">
        No results
      </h3>
      <p className="text-sm text-gray-400 mb-6 max-w-sm">
        We found no movies for your search. Check the spelling or
        try another term.
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
        Browse the full catalog
      </Link>
    </div>
  );
}