// app/api/admin/tmdb/movie/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOOLS_ENABLED } from '@/lib/config/adminTools';
import { isTmdbConfigured } from '@/lib/api/tmdb/config';
import { getMoviePreview, generateSlugCandidates } from '@/lib/api/tmdb';
import {
  checkSlugsTaken,
  findExistingMovieByTmdbId,
} from '@/lib/api/repositories/adminImport';

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
  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }
  const preview = await getMoviePreview(id);
  if (!preview) {
    return NextResponse.json(
      { error: 'Película no encontrada en TMDB' },
      { status: 404 }
    );
  }

  // Verificar si ya existe en la DB (para mostrar estado "ya existe")
  const existingMovie = await findExistingMovieByTmdbId(preview.tmdbId);

  const baseCandidates = generateSlugCandidates({
    originalTitle: preview.originalTitle,
    englishTitle: preview.englishTitle,
    spanishTitle: preview.spanishTitle,
    year: preview.year || undefined,
  });
  const slugs = baseCandidates.map((candidate) => candidate.slug);
  const takenSet = await checkSlugsTaken('movies', slugs);
  const slugCandidates = baseCandidates.map((candidate) => ({
    slug: candidate.slug,
    source: candidate.source,
    taken: takenSet.has(candidate.slug),
    recommended: false,
  }));
  const firstAvailable = slugCandidates.find(
    (candidate) => !candidate.taken
  );
  if (firstAvailable) firstAvailable.recommended = true;

  return NextResponse.json({
    preview,
    slugCandidates,
    existsInDb: Boolean(existingMovie),
    existingSlug: existingMovie?.slug ?? null,
  });
}
