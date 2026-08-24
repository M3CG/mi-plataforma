import { NextRequest, NextResponse } from 'next/server';
import { fetchApi } from '@/lib/api/http/client';
import { checkRateLimit, getClientIp } from '@/lib/utils/rate-limit';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const { allowed } = checkRateLimit(clientIp);
  
  if (!allowed) {
    return NextResponse.json({ suggestions: [] }, { status: 429 });
  }

  const query = request.nextUrl.searchParams.get('q')?.trim();
  const limit = request.nextUrl.searchParams.get('limit') || '8';
  
  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const result = await fetchApi('/movies/autocomplete', {
      q: query,
      limit,
    });

    return NextResponse.json(result || { suggestions: [] });
  } catch (error) {
    logger.error('Error in /api/movies/autocomplete', {
      component: 'BFF',
      action: 'GET /api/movies/autocomplete',
      error,
    });
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}