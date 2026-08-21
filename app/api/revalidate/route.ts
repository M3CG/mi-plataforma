// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { logger } from '@/lib/utils/logger';

/**
 * Endpoint de revalidación de caché.
 *
 * Recibe webhooks desde Strapi cuando el contenido cambia.
 * Requiere el header `x-revalidation-secret` con el secreto compartido.
 *
 * Configurar en .env:
 *   REVALIDATION_SECRET=tu-secreto-compartido
 */

const TAG_MAP: Record<string, string[]> = {
  movie: ['movies', 'movies:list', 'movies:home', 'movies:genre-ranked'],
  category: ['categories'],
  actor: ['actors'],
  director: ['actors'],
  server: ['movies'],
};

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidation-secret');

  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { error: 'Invalid revalidation secret' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { model, event } = body;

    if (!model) {
      return NextResponse.json(
        { error: 'Missing model in request body' },
        { status: 400 }
      );
    }

    const tags = TAG_MAP[model] ?? [];

    tags.forEach((tag) => {
      // Next.js 16 requiere el segundo argumento (profile).
      // 'default' usa el perfil de revalidación estándar.
      revalidateTag(tag, 'default');
    });

    logger.info(`Revalidated tags for ${model} (${event})`, {
      component: 'Revalidate',
      action: 'POST /api/revalidate',
      model,
      event,
      tags,
    });

    return NextResponse.json({
      revalidated: true,
      model,
      tags,
    });
  } catch (error) {
    logger.error('Error in revalidation endpoint', {
      component: 'Revalidate',
      action: 'POST /api/revalidate',
      error,
    });

    return NextResponse.json(
      { error: 'Internal revalidation error' },
      { status: 500 }
    );
  }
}
