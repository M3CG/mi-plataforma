// app/api/admin/movies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOOLS_ENABLED } from '@/lib/config/adminTools';
import { isTmdbConfigured } from '@/lib/api/tmdb/config';
import { getMoviePreview } from '@/lib/api/tmdb';
import { importMovie } from '@/lib/api/repositories/adminImport';

export async function POST(request: NextRequest) {
  if (!ADMIN_TOOLS_ENABLED) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isTmdbConfigured()) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY no configurada' },
      { status: 500 }
    );
  }
  let body: {
    tmdbId?: number;
    slug?: string;
    posterUrl?: string;
    backdropUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'JSON inválido' },
      { status: 400 }
    );
  }
  const { tmdbId, slug } = body;
  if (!tmdbId || !slug) {
    return NextResponse.json(
      { error: 'tmdbId y slug son requeridos' },
      { status: 400 }
    );
  }

  // Re-consultamos TMDB server-side: no confiamos en el payload del cliente.
  const preview = await getMoviePreview(tmdbId);
  if (!preview) {
    return NextResponse.json(
      { error: 'No se pudo obtener la película desde TMDB' },
      { status: 502 }
    );
  }

  const result = await importMovie(preview, {
    slug,
    posterUrl: body.posterUrl,
    backdropUrl: body.backdropUrl,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? 'No se pudo crear la película' },
      { status: 409 }
    );
  }
  return NextResponse.json(result);
}
