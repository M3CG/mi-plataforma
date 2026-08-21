import { describe, it, expect } from 'vitest';
import { normalizeMovie, normalizeCategory, normalizeServer } from '../normalizers';

describe('normalizeMovie', () => {
  const validMovie = {
    id: 1,
    documentId: 'doc-1',
    title: 'Test Movie',
    slug: 'test-movie',
    synopsis: 'A test movie',
    year: 2024,
    rating: 7.5,
    country: 'US',
    tmdb_id: 12345,
    poster_url: 'https://example.com/poster.jpg',
  };

  it('normalizes a valid movie', () => {
    const movie = normalizeMovie(validMovie);
    expect(movie).not.toBeNull();
    expect(movie!.title).toBe('Test Movie');
    expect(movie!.slug).toBe('test-movie');
    expect(movie!.year).toBe(2024);
    expect(movie!.rating).toBe(7.5);
  });

  it('returns null for invalid movie (missing required fields)', () => {
    const movie = normalizeMovie({ invalid: true });
    expect(movie).toBeNull();
  });

  it('resolves slug when missing', () => {
    const raw = { ...validMovie, slug: null };
    const movie = normalizeMovie(raw);
    expect(movie).not.toBeNull();
    expect(movie!.slug).toBeTruthy();
  });

  it('handles missing optional fields', () => {
    const raw = {
      id: 2,
      documentId: 'doc-2',
      title: 'Minimal',
      slug: 'minimal',
    };
    const movie = normalizeMovie(raw);
    expect(movie).not.toBeNull();
    expect(movie!.synopsis).toBe('');
    expect(movie!.year).toBe(0);
    expect(movie!.rating).toBe(0);
  });

  it('normalizes nested relations', () => {
    const raw = {
      ...validMovie,
      categories: [
        { id: 1, name: 'Action', slug: 'action' },
      ],
      servers: [
        { id: 1, name: 'Server 1', url: 'https://example.com/embed/1' },
      ],
    };
    const movie = normalizeMovie(raw);
    expect(movie).not.toBeNull();
    expect(movie!.categories).toHaveLength(1);
    expect(movie!.servers).toHaveLength(1);
  });
});

describe('normalizeCategory', () => {
  it('normalizes a valid category', () => {
    const cat = normalizeCategory({ id: 1, name: 'Action', slug: 'action' });
    expect(cat).not.toBeNull();
    expect(cat!.name).toBe('Action');
    expect(cat!.slug).toBe('action');
  });

  it('generates slug from name if missing', () => {
    const cat = normalizeCategory({ id: 1, name: 'Science Fiction', slug: null });
    expect(cat).not.toBeNull();
    expect(cat!.slug).toBe('science-fiction');
  });
});

describe('normalizeServer', () => {
  it('normalizes a valid server', () => {
    const server = normalizeServer({
      id: 1,
      name: 'VidSrc',
      url: 'https://vidsrc.to/embed/movie/123',
    });
    expect(server).not.toBeNull();
    expect(server!.name).toBe('VidSrc');
  });

  it('rejects server with invalid URL', () => {
    const server = normalizeServer({
      id: 1,
      name: 'Bad',
      url: 'javascript:alert(1)',
    });
    expect(server).toBeNull();
  });
});
