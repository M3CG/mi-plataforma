// app/api/movies/autocomplete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/utils/rate-limit';
import { logger } from '@/lib/utils/logger';
import { tmdbSearchMovies } from '@/lib/api/tmdb/client';
import { tmdbImageUrl } from '@/lib/api/tmdb/config';
import { generateTmdbSlug } from '@/lib/api/tmdb/slugResolver';

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const { allowed } = checkRateLimit(clientIp);
  if (!allowed) {
    return NextResponse.json({ suggestions: [] }, { status: 429 });
  }

  const query = request.nextUrl.searchParams.get('q')?.trim();
  const limit = Math.min(
    Number(request.nextUrl.searchParams.get('limit') || '8'),
    20
  );

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const results = await tmdbSearchMovies(query);
    const rawResults = (results?.results ?? []).slice(0, limit);

    const suggestions = rawResults.map((movie) => ({
      id: movie.id,
      title: movie.title || movie.original_title || '',
      slug: generateTmdbSlug(movie.id, movie.title || movie.original_title || ''),
      year: movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : null,
      rating: movie.vote_average ?? 0,
      posterUrl: tmdbImageUrl(movie.poster_path, 'w185'),
      score: movie.popularity ?? 0,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    logger.error('Error in /api/movies/autocomplete', {
      component: 'BFF',
      action: 'GET /api/movies/autocomplete',
      error,
    });
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}