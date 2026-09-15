import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/utils/rate-limit';
import { API_URL } from '@/lib/api/http/config';
import { logger } from '@/lib/utils/logger';
import { isTmdbConfigured } from '@/lib/api/tmdb/config';
import { getMoviePreview, generateSlugCandidates } from '@/lib/api/tmdb';
import {
  checkSlugsTaken,
  checkMovieTmdbIds,
} from '@/lib/api/repositories/adminImport';

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

function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== 'string') return false;
  const trimmed = slug.trim();
  return trimmed.length >= 1 && trimmed.length <= 200 && trimmed !== 'undefined' && trimmed !== 'null';
}

function isValidTmdbId(tmdbId: unknown): tmdbId is number {
  return typeof tmdbId === 'number' && Number.isFinite(tmdbId) && tmdbId > 0;
}

/**
 * Crea la película en Strapi automáticamente.
 * Proceso de fondo: se dispara la primera vez que un usuario ve una película.
 */
async function autoCreateMovieInStrapi(tmdbId: number): Promise<{
  created: boolean;
  slug?: string;
}> {
  if (!isTmdbConfigured()) {
    return { created: false };
  }

  try {
    // Verificar si ya existe en Strapi por tmdb_id
    const existingIds = await checkMovieTmdbIds([tmdbId]);
    if (existingIds.includes(tmdbId)) {
      return { created: false };
    }

    // Obtener datos de TMDB
    const preview = await getMoviePreview(tmdbId);
    if (!preview) {
      return { created: false };
    }

    // Generar slug candidates con la lógica existente
    const baseCandidates = generateSlugCandidates({
      originalTitle: preview.originalTitle,
      englishTitle: preview.englishTitle,
      spanishTitle: preview.spanishTitle,
      year: preview.year || undefined,
    });

    const slugs = baseCandidates.map((c) => c.slug);
    const takenSet = await checkSlugsTaken('movies', slugs);

    // Elegir el primer slug disponible
    let selectedSlug: string | null = null;
    for (const candidate of baseCandidates) {
      if (!takenSet.has(candidate.slug)) {
        selectedSlug = candidate.slug;
        break;
      }
    }

    if (!selectedSlug) {
      // Todos los slugs están ocupados, usar el último con índice
      const lastSlug = slugs[slugs.length - 1];
      selectedSlug = `${lastSlug}-${Date.now()}`;
    }

    // Crear la película en Strapi usando la misma lógica del admin import
    const { importMovie } = await import('@/lib/api/repositories/adminImport');
    const result = await importMovie(preview, {
      slug: selectedSlug,
      posterUrl: preview.defaultPosterUrl,
      backdropUrl: preview.defaultBackdropUrl,
    });

    if (result.ok) {
      logger.info('Película creada automáticamente en Strapi', {
        component: 'BFF',
        action: 'POST /api/movies/view',
        tmdbId,
        slug: selectedSlug,
        documentId: result.documentId,
      });
      return { created: true, slug: selectedSlug };
    }

    return { created: false };
  } catch (error) {
    logger.error('Error creando película automáticamente en Strapi', {
      component: 'BFF',
      action: 'POST /api/movies/view',
      tmdbId,
      error,
    });
    return { created: false };
  }
}

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
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug, tmdbId } = body ?? {};

  if (!isValidSlug(slug) || !isValidTmdbId(tmdbId)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid slug or tmdbId' },
      { status: 400 }
    );
  }

  const strapiToken = process.env.STRAPI_API_TOKEN;
  const strapiUrl = (API_URL || 'http://localhost:1337').replace(/\/$/, '');

  try {
    // Paso 1: Intentar crear la película si no existe (fondo, no bloquea)
    await autoCreateMovieInStrapi(tmdbId);

    // Paso 2: Incrementar views en Strapi
    // Buscar por slug (puede ser el slug de Strapi o el de TMDB)
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
        tmdbId,
        status: response.status,
      });
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    logger.debug('View tracking failed silently', {
      component: 'BFF',
      action: 'POST /api/movies/view',
      slug,
      tmdbId,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}