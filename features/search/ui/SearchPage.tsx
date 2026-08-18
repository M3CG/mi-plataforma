// features/search/ui/SearchPage.tsx
import type { ReactNode } from 'react';
import type { SearchPageData } from '../types';

import SearchHeader from './SearchHeader';
import SearchResults from './SearchResults';
import SearchEmptyState from './SearchEmptyState';
import SearchNoQueryState from './SearchNoQueryState';

interface SearchPageProps {
  data: SearchPageData;
  afterResultsSlot?: ReactNode;
}

export default function SearchPage({
  data,
  afterResultsSlot,
}: SearchPageProps) {
  if (!data.hasQuery) {
    return (
      <main className="min-h-screen p-8">
        <SearchNoQueryState />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <SearchHeader
        query={data.normalizedQuery}
        count={data.count}
      />

      {data.hasResults ? (
        <>
          <SearchResults results={data.results} />
          {afterResultsSlot}
        </>
      ) : (
        <SearchEmptyState />
      )}
    </main>
  );
}