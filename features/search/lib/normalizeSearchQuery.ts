// features/search/lib/normalizeSearchQuery.ts

export function normalizeSearchQuery(
  rawQuery?: string | string[]
): string {
  const query = Array.isArray(rawQuery)
    ? rawQuery.join(' ')
    : rawQuery ?? '';

  return query.trim();
}