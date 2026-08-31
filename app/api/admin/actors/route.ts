// app/api/admin/actors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOOLS_ENABLED } from '@/lib/config/adminTools';
import { isTmdbConfigured } from '@/lib/api/tmdb/config';
import { getPersonPreview } from '@/lib/api/tmdb';
import { importActor } from '@/lib/api/repositories/adminImport';

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
    profileImageUrl?: string;
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

  const preview = await getPersonPreview(tmdbId);
  if (!preview) {
    return NextResponse.json(
      { error: 'No se pudo obtener la persona desde TMDB' },
      { status: 502 }
    );
  }

  const result = await importActor(preview, {
    slug,
    profileImageUrl: body.profileImageUrl,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? 'No se pudo crear el actor' },
      { status: 409 }
    );
  }
  return NextResponse.json(result);
}
