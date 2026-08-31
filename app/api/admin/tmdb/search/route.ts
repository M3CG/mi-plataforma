// app/api/admin/tmdb/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOOLS_ENABLED } from '@/lib/config/adminTools';
import { isTmdbConfigured } from '@/lib/api/tmdb/config';
import {
  tmdbSearchMovies,
  tmdbSearchPersons,
  normalizeSearchMovie,
  normalizeSearchPerson,
} from '@/lib/api/tmdb';
import { checkMovieTmdbIds } from '@/lib/api/repositories/adminImport';

export async function GET(request: NextRequest) {
  if (!ADMIN_TOOLS_ENABLED) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isTmdbConfigured()) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY not configured' },
      { status: 500 }
    );
  }
  const query = request.nextUrl.searchParams.get('q')?.trim();
  const type =
    request.nextUrl.searchParams.get('type') === 'person'
      ? 'person'
      : 'movie';
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (type === 'person') {
    const raw = await tmdbSearchPersons(query);
    const results = (raw?.results ?? []).map(normalizeSearchPerson);
    return NextResponse.json({ results });
  }

  const raw = await tmdbSearchMovies(query);
  const results = (raw?.results ?? []).map(normalizeSearchMovie);

  // Marcar cuáles ya están en la DB
  const tmdbIds = results
    .map((r) => r.tmdbId)
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

  const resultsWithDb = results.map((r) => ({
    ...r,
    inDatabase: inDbSet.has(r.tmdbId as number),
  }));

  return NextResponse.json({ results: resultsWithDb });
}
