import { describe, it, expect } from 'vitest';
import { slugify, isLatinizable, chooseSlug, isValidSlug } from '../slugify';

describe('slugify', () => {
  it('converts simple text to slug', () => {
    expect(slugify('The Odyssey')).toBe('the-odyssey');
  });

  it('removes accents', () => {
    expect(slugify('Misión: Imposible')).toBe('mision-imposible');
  });

  it('returns empty for non-latinizable text', () => {
    expect(slugify('올드보이')).toBe('');
  });

  it('handles multiple spaces and special chars', () => {
    expect(slugify('  Hello   World! 2024  ')).toBe('hello-world-2024');
  });

  it('respects maxLength', () => {
    const result = slugify('a'.repeat(100), 10);
    expect(result.length).toBeLessThanOrEqual(10);
  });
});

describe('isLatinizable', () => {
  it('returns true for latin text', () => {
    expect(isLatinizable('Hello World')).toBe(true);
  });

  it('returns false for non-latin text', () => {
    expect(isLatinizable('올드보이')).toBe(false);
  });

  it('returns false for single char', () => {
    expect(isLatinizable('A')).toBe(false);
  });
});

describe('chooseSlug', () => {
  it('chooses first latinizable candidate', () => {
    expect(chooseSlug(['올드보이', 'Oldboy', 'Oldeuboi'])).toBe('oldboy');
  });

  it('skips null and undefined candidates', () => {
    expect(chooseSlug([null, undefined, 'Valid Title'])).toBe('valid-title');
  });

  it('returns empty when no candidates are latinizable', () => {
    expect(chooseSlug(['올드보이', 'オールドボーイ'])).toBe('');
  });
});

describe('isValidSlug', () => {
  it('returns true for valid slugs', () => {
    expect(isValidSlug('the-odyssey')).toBe(true);
    expect(isValidSlug('movie-123')).toBe(true);
  });

  it('returns false for "undefined"', () => {
    expect(isValidSlug('undefined')).toBe(false);
  });

  it('returns false for "null"', () => {
    expect(isValidSlug('null')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidSlug('')).toBe(false);
  });

  it('returns false for null/undefined input', () => {
    expect(isValidSlug(null)).toBe(false);
    expect(isValidSlug(undefined)).toBe(false);
  });
});
