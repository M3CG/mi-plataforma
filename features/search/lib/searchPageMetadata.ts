// features/search/lib/searchPageMetadata.ts
import type { Metadata } from 'next';
import { normalizeSearchQuery } from './normalizeSearchQuery';

export function buildSearchMetadata(
  rawQuery?: string | string[]
): Metadata {
  const query = normalizeSearchQuery(rawQuery);
  if (!query) {
    return {
      title: 'Search | Cinelito',
      description:
        'Search movies by title, actor, director or genre on Cinelito.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }
  return {
    title: `Search: "${query}" | Cinelito`,
    description: `Search results for "${query}" on Cinelito.`,
    openGraph: {
      title: `Search: "${query}" | Cinelito`,
      description: `Search results for "${query}" on Cinelito.`,
    },
    twitter: {
      card: 'summary',
      title: `Search: "${query}" | Cinelito`,
      description: `Search results for "${query}" on Cinelito.`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}
