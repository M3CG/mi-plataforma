// features/search/lib/searchPageMetadata.ts
import type { Metadata } from 'next';
import { normalizeSearchQuery } from './normalizeSearchQuery';

export function buildSearchMetadata(
  rawQuery?: string | string[]
): Metadata {
  const query = normalizeSearchQuery(rawQuery);
  if (!query) {
    return {
      title: 'Search | CineStream',
      description:
        'Search movies by title, actor, director or genre on CineStream.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }
  return {
    title: `Search: "${query}" | CineStream`,
    description: `Search results for "${query}" on CineStream.`,
    openGraph: {
      title: `Search: "${query}" | CineStream`,
      description: `Search results for "${query}" on CineStream.`,
    },
    twitter: {
      card: 'summary',
      title: `Search: "${query}" | CineStream`,
      description: `Search results for "${query}" on CineStream.`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}
