import { describe, it, expect } from 'vitest';
import { mergeSearchResults } from '../mergeSearchResults';
import type { Movie } from '@/entities/movie';

const createMockMovie = (overrides: Partial<Movie> = {}): Movie => ({
  id: 1,
  documentId: 'doc-1',
  title: 'Test Movie',
  slug: 'test-movie',
  synopsis: 'Test synopsis',
  year: 2024,
  rating: 7.5,
  country: 'US',
  tmdb_id: 12345,
  ...overrides,
});

describe('mergeSearchResults', () => {
  it('deduplicates movies by identity', () => {
    const movie = createMockMovie({ id: 1, documentId: 'doc-1' });
    const results = mergeSearchResults(
      [
        { movies: [movie], source: 'title' },
        { movies: [movie], source: 'actor' },
      ],
      'test'
    );
    expect(results).toHaveLength(1);
  });

  it('merges different movies', () => {
    const movie1 = createMockMovie({ id: 1, documentId: 'doc-1', title: 'Movie A' });
    const movie2 = createMockMovie({ id: 2, documentId: 'doc-2', title: 'Movie B' });
    const results = mergeSearchResults(
      [
        { movies: [movie1], source: 'title' },
        { movies: [movie2], source: 'actor' },
      ],
      'test'
    );
    expect(results).toHaveLength(2);
  });

  it('returns empty for empty input', () => {
    const results = mergeSearchResults([], 'test');
    expect(results).toHaveLength(0);
  });

  it('handles empty movie arrays', () => {
    const results = mergeSearchResults(
      [{ movies: [], source: 'title' }],
      'test'
    );
    expect(results).toHaveLength(0);
  });
});
