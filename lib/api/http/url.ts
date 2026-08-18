// lib/api/http/url.ts
import { API_URL } from './config';

export function cleanApiUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '');
}

function cleanEndpoint(endpoint: string): string {
  return endpoint.replace(/^\/+/, '');
}

export function buildApiUrl(
  endpoint: string,
  params: Record<string, string | string[] | undefined>
): URL {
  const base = cleanApiUrl(API_URL);
  const path = cleanEndpoint(endpoint);
  const url = new URL(`${base}/api/${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) url.searchParams.append(key, item);
      });
    } else {
      url.searchParams.set(key, value);
    }
  });

  return url;
}