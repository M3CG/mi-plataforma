// app/api/admin/tmdb/discover/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOOLS_ENABLED } from '@/lib/config/adminTools';
import { isTmdbConfigured } from '@/lib/api/tmdb/config';
import { discoverMovies } from '@/lib/api/tmdb/discover';
import { checkMovieTmdbIds } from '@/lib/api/repositories/adminImport';

export async function GET(request: NextRequest) {
  if (!ADMIN_TOOLS_ENABLED) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isTmdbConfigured()) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY no configurada' },
      { status: 500 }
    );
  }
  const page = Math.max(
    1,
    Number(request.nextUrl.searchParams.get('page')) || 1
  );
  const result = await discoverMovies(request.nextUrl.searchParams, page);

  // Marcar cuáles ya están en la DB
  const tmdbIds = result.results
    .map((m) => m.tmdbId)
    .filter((id): id is number => typeof id === 'number');
  const inDbSet = new Set<number>();
  if (tmdbIds.length > 0) {
    try {
      const found = await checkMovieTmdbIds(tmdbIds);
      found.forEach((id) => inDbSet.add(id));
    } catch {
      // Si falla el check, no marcamos ninguno
    }
  }

  const resultsWithDb = result.results.map((m) => ({
    ...m,
    inDatabase: inDbSet.has(m.tmdbId as number),
  }));

  return NextResponse.json({
    ...result,
    results: resultsWithDb,
  });
}
