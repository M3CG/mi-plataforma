// app/api/movies/view/route.ts
import { after } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/utils/rate-limit';
import { logger } from '@/lib/utils/logger';
import { extractTmdbIdFromSlug } from '@/lib/api/tmdb/slugResolver';
import {
  materializeMovieFromTmdb,
  incrementMovieView,
} from '@/lib/api/repositories/adminImport';

// La materialización corre post-response vía after(), pero dentro del
// presupuesto de la función. Default de Vercel (10s) puede cortarla a
// mitad con Strapi remoto. 60s = margen completo para el caso realista
// (TMDB + relaciones + inserts), con tope para el patológico.
export const maxDuration = 60;

// ── Rate limiter (idéntico al anterior: se conserva sin cambios) ──

const VIEW_RATE_LIMIT_WINDOW_MS = 60_000;
const VIEW_RATE_LIMIT_MAX = 10;

interface ViewRateEntry {
  count: number;
  resetTime: number;
}

const viewRateStore = new Map<string, ViewRateEntry>();

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

// ── Resolución del identificador ──

/**
 * Acepta:
 *  - { tmdbId: number }            ← contrato preferido
 *  - { tmdbId: "603" }             ← número como string (defensivo)
 *  - { slug: "603-the-matrix" }    ← slug de URL de TMDB (compatibilidad)
 *
 * NO acepta slugs canónicos de DB ("the-matrix"): un slug sin prefijo
 * numérico no contiene información para resolver el tmdbId. ViewTracker
 * debe enviar siempre tmdbId.
 */
function resolveTmdbId(
  body: { slug?: unknown; tmdbId?: unknown } | null
): number | null {
  const { tmdbId, slug } = body ?? {};

  if (typeof tmdbId === 'number' && Number.isFinite(tmdbId) && tmdbId > 0) {
    return tmdbId;
  }
  if (typeof tmdbId === 'string') {
    const parsed = Number(tmdbId);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  if (
    typeof slug === 'string' &&
    slug.trim().length >= 1 &&
    slug.trim().length <= 200
  ) {
    return extractTmdbIdFromSlug(slug.trim());
  }
  return null;
}

// ── Trabajo de fondo (corre post-response vía after) ──

async function trackView(tmdbId: number): Promise<void> {
  const record = await materializeMovieFromTmdb(tmdbId);
  if (!record) {
    logger.warn('View no registrada: no se pudo materializar la película', {
      component: 'BFF',
      action: 'POST /api/movies/view',
      tmdbId,
    });
    return;
  }

  const ok = await incrementMovieView(record.slug);
  if (!ok) {
    logger.warn('View no registrada: Strapi rechazó el incremento', {
      component: 'BFF',
      action: 'POST /api/movies/view',
      tmdbId,
      slug: record.slug,
    });
  }
}

// ── Handler ──

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const { allowed } = checkViewRateLimit(clientIp);
  if (!allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: { slug?: unknown; tmdbId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const tmdbId = resolveTmdbId(body);
  if (!tmdbId) {
    return NextResponse.json(
      { ok: false, error: 'Valid tmdbId or TMDB slug required' },
      { status: 400 }
    );
  }

  // La respuesta sale YA: el usuario nunca espera la materialización
  // (TMDB + relaciones + Strapi pueden tardar segundos en una película
  // fría). Todo el trabajo corre post-response.
  after(async () => {
    try {
      await trackView(tmdbId);
    } catch (error) {
      logger.error('View tracking falló', {
        component: 'BFF',
        action: 'POST /api/movies/view',
        tmdbId,
        error,
      });
    }
  });

  // 200 (no 202) por compatibilidad con consumers que validen el status
  // exacto. El body indica que el trabajo quedó encolado.
  return NextResponse.json({ ok: true, queued: true });
}