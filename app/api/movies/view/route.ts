import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/utils/rate-limit';
import { API_URL } from '@/lib/api/http/config';
import { logger } from '@/lib/utils/logger';

/**
 * BFF endpoint para tracking de vistas de películas.
 *
 * POST /api/movies/view
 * Body: { slug: string }
 *
 * Diseñado para ser fire-and-forget: el ViewTracker del frontend
 * dispara esta petición sin esperar respuesta ni bloquear la UX.
 *
 * Rate limiting:
 *   - 10 requests por minuto por IP (anti-spam de views)
 *   - Si se excede, devuelve 429 silenciosamente
 *
 * Seguridad:
 *   - Valida el slug antes de propagar a Strapi
 *   - Forward con STRAPI_API_TOKEN (comunicación server-to-server)
 */

const VIEW_RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const VIEW_RATE_LIMIT_MAX = 10;            // 10 views por minuto por IP

// Rate limiter específico para views (separado del rate limit general)
interface ViewRateEntry {
  count: number;
  resetTime: number;
}
const viewRateStore = new Map<string, ViewRateEntry>();

// Limpieza periódica
if (typeof globalThis !== 'undefined') {
  const cleanupKey = '__view_rate_cleanup';
  const g = globalThis as Record<string, unknown>;
  if (!g[cleanupKey]) {
    g[cleanupKey] = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of viewRateStore.entries()) {
        if (now > entry.resetTime) {
          viewRateStore.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }
}

function checkViewRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const entry = viewRateStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    viewRateStore.set(identifier, {
      count: 1,
      resetTime: now + VIEW_RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: VIEW_RATE_LIMIT_MAX - 1 };
  }

  entry.count++;

  if (entry.count > VIEW_RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: VIEW_RATE_LIMIT_MAX - entry.count };
}

function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== 'string') return false;
  const trimmed = slug.trim();
  return (
    trimmed.length >= 1 &&
    trimmed.length <= 200 &&
    trimmed !== 'undefined' &&
    trimmed !== 'null'
  );
}

export async function POST(request: NextRequest) {
  // ─── Rate limiting ───
  const clientIp = getClientIp(request);
  const { allowed } = checkViewRateLimit(clientIp);

  if (!allowed) {
    // Silencioso: no loguear rate limits de views para no saturar logs
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  // ─── Parsear body ───
  let body: { slug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug } = body ?? {};

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid slug' },
      { status: 400 }
    );
  }

  // ─── Forward a Strapi ───
  const strapiToken = process.env.STRAPI_API_TOKEN;
  const strapiUrl = (API_URL || 'http://localhost:1337').replace(/\/$/, '');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(`${strapiUrl}/api/movies/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(strapiToken ? { Authorization: `Bearer ${strapiToken}` } : {}),
      },
      body: JSON.stringify({ slug }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      logger.debug('Strapi view tracking returned non-OK', {
        component: 'BFF',
        action: 'POST /api/movies/view',
        slug,
        status: response.status,
      });
      // Igualmente devolver 200 al cliente (fire-and-forget)
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    // Silencioso: el tracking no debe afectar al usuario
    logger.debug('View tracking failed silently', {
      component: 'BFF',
      action: 'POST /api/movies/view',
      slug,
      error: error instanceof Error ? error.message : String(error),
    });

    // Devolver 200 igual para que el cliente no lo trate como error
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
