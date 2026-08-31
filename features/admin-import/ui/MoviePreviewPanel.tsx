// features/admin-import/ui/MoviePreviewPanel.tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
import type {
  ImportStatus,
  MoviePreview,
  SlugCandidate,
} from '../types';
import SlugSelector from './SlugSelector';
import PosterSelector from './PosterSelector';

interface MoviePreviewPanelProps {
  preview: MoviePreview;
  slugCandidates: SlugCandidate[];
  importStatus: ImportStatus;
  importMessage: string | null;
  onImport: (selection: {
    slug: string;
    posterUrl?: string;
    backdropUrl?: string;
  }) => void;
}

export default function MoviePreviewPanel({
  preview,
  slugCandidates,
  importStatus,
  importMessage,
  onImport,
}: MoviePreviewPanelProps) {
  const recommended =
    slugCandidates.find((c) => c.recommended) ??
    slugCandidates.find((c) => !c.taken) ??
    slugCandidates[0];
  const [selectedSlug, setSelectedSlug] = useState(
    recommended?.slug ?? ''
  );
  const [selectedPoster, setSelectedPoster] = useState(
    preview.defaultPosterUrl ?? ''
  );

  const posterOptions = preview.posters.map((poster) => ({
    url: poster.url,
    badge: poster.textless ? 'Sin texto' : undefined,
  }));

  const handleImport = () => {
    onImport({
      slug: selectedSlug,
      posterUrl: selectedPoster,
      backdropUrl: preview.defaultBackdropUrl,
    });
  };

  return (
    <section className="mt-10 bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      {preview.defaultBackdropUrl && (
        <div className="relative h-56 w-full">
          <Image
            src={preview.defaultBackdropUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />
        </div>
      )}
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {preview.originalTitle}{' '}
            {preview.year > 0 && (
              <span className="text-gray-400 font-light">
                ({preview.year})
              </span>
            )}
          </h2>
          {preview.englishTitle && (
            <p className="text-sm text-gray-400 mt-1">
              English title: {preview.englishTitle}
            </p>
          )}
          {preview.spanishTitle && (
            <p className="text-sm text-gray-400">
              Spanish title: {preview.spanishTitle}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            {preview.rating > 0 && (
              <span className="px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                ★ {preview.rating.toFixed(1)}
              </span>
            )}
            {preview.runtime && (
              <span className="px-2 py-1 rounded-full bg-white/5 text-gray-300">
                {preview.runtime} min
              </span>
            )}
            {preview.ageRating && (
              <span className="px-2 py-1 rounded-full bg-white/5 text-gray-300">
                {preview.ageRating}
              </span>
            )}
            {preview.country && (
              <span className="px-2 py-1 rounded-full bg-white/5 text-gray-300">
                {preview.country}
              </span>
            )}
          </div>
        </div>

        {preview.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {preview.genres.map((genre) => (
              <span
                key={genre.tmdbId}
                className="text-xs px-2.5 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-200"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-200 mb-2">
            Synopsis
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            {preview.mainSynopsis || 'No synopsis available.'}
          </p>
        </div>

        {preview.directors.length > 0 && (
          <p className="text-sm text-gray-400">
            <span className="text-gray-500 font-semibold">
              Director:
            </span>{' '}
            {preview.directors.map((d) => d.name).join(', ')}
          </p>
        )}

        {preview.cast.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-2">
              Cast
            </h3>
            <p className="text-sm text-gray-400">
              {preview.cast.map((c) => c.name).join(', ')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-white/5">
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-3">
              Slug (pick one)
            </h3>
            <SlugSelector
              candidates={slugCandidates}
              value={selectedSlug}
              onChange={setSelectedSlug}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-3">
              Poster (default: textless)
            </h3>
            <PosterSelector
              options={posterOptions}
              value={selectedPoster}
              onChange={setSelectedPoster}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
          <button
            onClick={handleImport}
            disabled={importStatus === 'saving' || !selectedSlug}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-6 py-3 rounded-full text-sm font-semibold text-white"
          >
            {importStatus === 'saving'
              ? 'Adding...'
              : 'Add movie'}
          </button>
          {importMessage && (
            <p
              className={
                importStatus === 'success'
                  ? 'text-green-400 text-sm'
                  : 'text-red-400 text-sm'
              }
            >
              {importMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
