// lib/utils/rate-limit.ts

/**
 * Rate limiter simple en memoria para el BFF.
 *
 * Nota: en serverless con múltiples instancias, cada instancia
 * tiene su propio contador. Para producción a escala, considerar
 * Redis o un servicio dedicado (Upstash, etc.).
 */

const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 30;     // 30 requests por minuto por IP

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpieza periódica para evitar memory leaks
if (typeof globalThis !== 'undefined') {
  const cleanupKey = '__rate_limit_cleanup';
  const g = globalThis as Record<string, unknown>;

  if (!g[cleanupKey]) {
    g[cleanupKey] = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store.entries()) {
        if (now > entry.resetTime) {
          store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }
}

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
