import type { Server } from '@/entities/movie';
import { LazyVideoPlayer, createMovieSources, PlayerErrorBoundary } from '@/features/player';
import { WATCH_SECTION_ID } from '@/features/movie-detail';

interface MoviePlayerSectionProps {
  movieSlug: string;
  tmdbId: number;
  servers: Server[];
}

export default function MoviePlayerSection({
  movieSlug,
  tmdbId,
  servers,
}: MoviePlayerSectionProps) {
  const sources = createMovieSources({
    tmdbId,
    manualServers: servers,
  });

  return (
    <div
      id={WATCH_SECTION_ID}
      className="scroll-mt-20 pt-10 border-t border-white/5 mb-10"
    >
      <h2 className="text-lg font-semibold text-white mb-4">
        Watch Movie
      </h2>
      <PlayerErrorBoundary>
        <LazyVideoPlayer key={movieSlug} sources={sources} />
      </PlayerErrorBoundary>
    </div>
  );
}