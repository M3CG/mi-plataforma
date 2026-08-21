import { describe, it, expect } from 'vitest';
import { findNextAvailableSource } from '../findNextAvailableSource';
import type { PlayableSource } from '../../types';

const createSource = (id: string): PlayableSource => ({
  id,
  name: `Source ${id}`,
  url: `https://example.com/${id}`,
});

describe('findNextAvailableSource', () => {
  const sources = [
    createSource('a'),
    createSource('b'),
    createSource('c'),
  ];

  it('finds next non-failed source', () => {
    const failed = new Set<string>();
    expect(findNextAvailableSource(sources, 0, failed)).toBe(1);
  });

  it('skips failed sources', () => {
    const failed = new Set(['b']);
    expect(findNextAvailableSource(sources, 0, failed)).toBe(2);
  });

  it('wraps around to beginning', () => {
    const failed = new Set<string>();
    expect(findNextAvailableSource(sources, 2, failed)).toBe(0);
  });

  it('returns -1 when all sources failed', () => {
    const failed = new Set(['a', 'b', 'c']);
    expect(findNextAvailableSource(sources, 0, failed)).toBe(-1);
  });

  it('returns -1 for empty sources', () => {
    const failed = new Set<string>();
    expect(findNextAvailableSource([], 0, failed)).toBe(-1);
  });

  it('skips multiple failed sources', () => {
    const failed = new Set(['b', 'c']);
    expect(findNextAvailableSource(sources, 0, failed)).toBe(-1);
  });
});
