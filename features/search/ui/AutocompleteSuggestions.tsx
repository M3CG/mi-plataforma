'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IconStar } from '@/shared/ui/icons';
import { routes } from '@/lib/routes';

interface Suggestion {
  id: number;
  title: string;
  slug: string;
  year: number;
  rating: number;
  posterUrl?: string;
  score: number;
}

interface AutocompleteSuggestionsProps {
  suggestions: Suggestion[];
  isLoading: boolean;
  query: string;
  onClose: () => void;
}

export default function AutocompleteSuggestions({
  suggestions,
  isLoading,
  query,
  onClose,
}: AutocompleteSuggestionsProps) {
  if (!query || query.length < 2) return null;
  if (!isLoading && suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-[300]">
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-2 border-red-600/60 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sm text-gray-400">Searching...</span>
        </div>
      )}

      {!isLoading && suggestions.length > 0 && (
        <div className="py-2">
          <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide">
            Sugerencias
          </div>

          {suggestions.map((suggestion) => (
            <Link
              key={suggestion.id}
              href={routes.movie(suggestion.slug)}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              {/* Poster */}
              <div className="relative w-10 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                {suggestion.posterUrl ? (
                  <Image
                    src={suggestion.posterUrl}
                    alt={suggestion.title}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    🎬
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">
                  {suggestion.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                  <span>{suggestion.year}</span>
                  {suggestion.rating > 0 && (
                    <>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <IconStar className="w-3 h-3 text-amber-400" />
                        <span>{suggestion.rating.toFixed(1)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Score indicator (opcional, para debug) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-[10px] text-gray-600 font-mono">
                  {Math.round(suggestion.score)}
                </div>
              )}
            </Link>
          ))}

          {/* Ver todos los resultados */}
          <Link
            href={routes.search(query)}
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-4 py-3 mt-2 border-t border-white/5 hover:bg-white/5 transition-colors text-sm text-red-400 hover:text-red-300"
          >
            See all results for &ldquo;{query}&rdquo;
          </Link>
        </div>
      )}
    </div>
  );
}
