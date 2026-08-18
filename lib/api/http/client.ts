// lib/api/http/client.ts
import { FETCH_TIMEOUT_MS } from './config';
import { buildApiUrl } from './url';
import type { NextFetchRequestConfig } from './types';
import { logger } from '@/lib/utils/logger';

export async function fetchApi<TJson = unknown>(
  endpoint: string,
  params: Record<string, string | string[] | undefined> = {},
  options: NextFetchRequestConfig = {}
): Promise<TJson | null> {
  const url = buildApiUrl(endpoint, params);
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      let errorBody = '';

      try {
        errorBody = await res.text();
      } catch {
        // Si no podemos leer el body, continuamos.
      }

      logger.error(`API Error [${res.status}]`, {
        component: 'API',
        action: endpoint,
        url: url.toString(),
        status: res.status,
        details: errorBody || undefined,
      });

      return null;
    }

    return (await res.json()) as TJson;
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof DOMException && error.name === 'AbortError') {
      logger.warn(
        `Timeout: Strapi no respondió en ${FETCH_TIMEOUT_MS / 1000}s`,
        {
          component: 'API',
          action: endpoint,
          url: url.toString(),
          timeoutMs: FETCH_TIMEOUT_MS,
        }
      );
    } else {
      logger.error('Network error fetching API', {
        component: 'API',
        action: endpoint,
        url: url.toString(),
        error,
      });
    }

    return null;
  }
}