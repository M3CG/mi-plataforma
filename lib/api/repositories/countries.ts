// lib/api/resources/countries.ts
import { fetchApi } from '../http/client';

export async function fetchCountries(): Promise<string[]> {
  const json = await fetchApi<unknown>(
    '/movies/countries',
    {},
    {
      next: {
        revalidate: 3600,
        tags: ['countries'],
      },
    }
  );

  const rawList = Array.isArray(json)
    ? json
    : Array.isArray((json as { data?: unknown[] })?.data)
      ? (json as { data: unknown[] }).data
      : [];

  const names = rawList
    .map((item) => {
      if (typeof item === 'string') return item;

      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        return (obj.name ?? obj.country ?? obj.value) as
          | string
          | undefined;
      }

      return undefined;
    })
    .filter((value): value is string => Boolean(value && value.trim()));

  const unique = Array.from(new Set(names.map((name) => name.trim())));

  return unique.sort(
    new Intl.Collator('es', { sensitivity: 'base' }).compare
  );
}