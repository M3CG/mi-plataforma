// features/filters/lib/filterUrlSerializer.ts

/**
 * Construye una URL con query params mutados.
 * Función pura: no depende de router ni de estado externo.
 */
export function buildFiltersUrl(
  basePath: string,
  mutate: (params: URLSearchParams) => void,
  currentParams?: URLSearchParams
): string {
  const params = new URLSearchParams(currentParams?.toString() ?? '');
  mutate(params);
  return `${basePath}?${params.toString()}`;
}