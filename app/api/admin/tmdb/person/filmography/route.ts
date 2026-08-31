// app/api/admin/tmdb/person/filmography/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOOLS_ENABLED } from '@/lib/config/adminTools';
import { isTmdbConfigured, tmdbImageUrl } from '@/lib/api/tmdb/config';
import { tmdbGetPersonMovieCredits } from '@/lib/api/tmdb/client';

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

  const credits = await tmdbGetPersonMovieCredits(id);
  if (!credits) {
    return NextResponse.json(
      { error: 'No se pudo obtener la filmografía' },
      { status: 404 }
    );
  }

  // Normalizar filmografía
  const normalizeFilmography = (
    items: Array<{
      id: number;
      title: string;
      original_title: string;
      release_date?: string;
      poster_path?: string | null;
      vote_average?: number;
      overview?: string;
      character?: string;
      job?: string;
    }> | undefined,
    role: 'cast' | 'crew'
  ) => {
    return (items ?? [])
      .filter((m) => m.id && m.title)
      .map((m) => ({
        tmdbId: m.id,
        title: m.title,
        originalTitle: m.original_title,
        year: m.release_date
          ? new Date(m.release_date).getFullYear()
          : undefined,
        posterUrl: tmdbImageUrl(m.poster_path, 'w342'),
        rating: m.vote_average ?? 0,
        overview: m.overview ?? '',
        role: role === 'cast' ? (m.character ?? 'Actor') : (m.job ?? 'Crew'),
      }))
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  };

  const castMovies = normalizeFilmography(credits.cast, 'cast');
  const crewMovies = normalizeFilmography(credits.crew, 'crew');

  // Verificar cuáles ya están en la DB
  const allTmdbIds = [
    ...new Set([...castMovies, ...crewMovies].map((m) => m.tmdbId)),
  ];
  const inDbSet = new Set<number>();
  if (allTmdbIds.length > 0) {
    try {
      const { checkMovieTmdbIds } = await import(
        '@/lib/api/repositories/adminImport'
      );
      const found = await checkMovieTmdbIds(allTmdbIds);
      found.forEach((id) => inDbSet.add(id));
    } catch {
      // Si falla el check, no marcamos ninguno como existente
    }
  }

  return NextResponse.json({
    cast: castMovies.map((m) => ({ ...m, inDatabase: inDbSet.has(m.tmdbId) })),
    crew: crewMovies.map((m) => ({ ...m, inDatabase: inDbSet.has(m.tmdbId) })),
  });
}
