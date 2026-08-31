// features/admin-import/ui/MovieImportDetail.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import BackButton from '@/shared/ui/BackButton';
import { useMoviePreview } from '../model/useMoviePreview';
import { useImportMovie } from '../model/useImport';
import SlugSelector from './SlugSelector';
import PosterSelector from './PosterSelector';

interface MovieImportDetailProps {
  tmdbId: number;
}

export default function MovieImportDetail({ tmdbId }: MovieImportDetailProps) {
  const router = useRouter();
  const {
    preview,
    slugCandidates,
    existsInDb,
    existingSlug,
    isLoading,
    error,
    load,
  } = useMoviePreview();
  const { status, message, importMovie } = useImportMovie();

  const [selectedSlug, setSelectedSlug] = useState('');
  const [selectedPoster, setSelectedPoster] = useState('');

  useEffect(() => {
    load(tmdbId);
  }, [tmdbId, load]);

  useEffect(() => {
    if (preview) {
      const recommended =
        slugCandidates.find((c) => c.recommended) ??
        slugCandidates.find((c) => !c.taken) ??
        slugCandidates[0];
            // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSlug(recommended?.slug ?? '');
      setSelectedPoster(preview.defaultPosterUrl ?? '');
    }
  }, [preview, slugCandidates]);

  // Redirigir después de éxito: volver a la página anterior
  // (preserva filtros, búsqueda y tab del flujo de importación)
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
        } else {
          router.push('/admin/import');
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-600/60 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Cargando película...</p>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error ?? 'Película no encontrada'}</p>
          <BackButton fallbackHref="/admin/import" />
        </div>
      </div>
    );
  }

  const posterOptions = preview.posters.map((poster) => ({
    url: poster.url,
    badge: poster.textless ? 'Sin texto' : undefined,
  }));

  const handleImport = () => {
    importMovie({
      tmdbId: preview.tmdbId,
      slug: selectedSlug,
      posterUrl: selectedPoster,
      backdropUrl: preview.defaultBackdropUrl,
    });
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <BackButton fallbackHref="/admin/import" />
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
            Solo desarrollo local
          </span>
        </div>

        {/* ═══ BANNER: Ya existe en la DB ═══ */}
        {existsInDb && (
          <div className="mb-6 p-4 rounded-2xl bg-green-600/10 border border-green-500/30 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center flex-shrink-0">
              <span className="text-green-400 text-xl">✓</span>
            </div>
            <div className="flex-1">
              <p className="text-green-200 font-semibold">
                Esta película ya está en la base de datos
              </p>
              <p className="text-green-300/70 text-sm mt-0.5">
                Slug actual:{' '}
                <code className="font-mono text-green-200">
                  {existingSlug}
                </code>
              </p>
            </div>
            {existingSlug && (
              <Link
                href={`/movie/${existingSlug}`}
                target="_blank"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm font-semibold flex-shrink-0"
              >
                Ver en el sitio →
              </Link>
            )}
          </div>
        )}

        {preview.defaultBackdropUrl && (
          <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-8">
            <Image
              src={preview.defaultBackdropUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {preview.originalTitle}{' '}
              {preview.year > 0 && (
                <span className="text-gray-400 font-light">
                  ({preview.year})
                </span>
              )}
            </h1>
            {preview.englishTitle && (
              <p className="text-sm text-gray-400 mt-1">
                Título inglés: {preview.englishTitle}
              </p>
            )}
            {preview.spanishTitle && (
              <p className="text-sm text-gray-400">
                Título español: {preview.spanishTitle}
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
              {preview.originalLanguage && (
                <span className="px-2 py-1 rounded-full bg-white/5 text-gray-300 uppercase">
                  {preview.originalLanguage}
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

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">
              Sinopsis
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {preview.mainSynopsis || 'Sin sinopsis disponible.'}
            </p>
            {preview.englishSynopsis &&
              preview.englishSynopsis !== preview.mainSynopsis && (
                <p className="text-xs text-gray-500 mt-3 italic">
                  EN: {preview.englishSynopsis}
                </p>
              )}
            {preview.spanishSynopsis &&
              preview.spanishSynopsis !== preview.mainSynopsis && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  ES: {preview.spanishSynopsis}
                </p>
              )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {preview.directors.length > 0 && (
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-200 mb-2">
                  Director
                </h3>
                <p className="text-sm text-gray-400">
                  {preview.directors.map((d) => d.name).join(', ')}
                </p>
              </div>
            )}
            {preview.cast.length > 0 && (
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-gray-200 mb-2">
                  Reparto principal
                </h3>
                <p className="text-sm text-gray-400">
                  {preview.cast.map((c) => c.name).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* ═══ Selectores + botón (solo si NO existe) ═══ */}
          {!existsInDb && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-200 mb-3">
                    Slug (elegí uno)
                  </h3>
                  <SlugSelector
                    candidates={slugCandidates}
                    value={selectedSlug}
                    onChange={setSelectedSlug}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-200 mb-3">
                    Póster (por defecto: sin texto)
                  </h3>
                  <PosterSelector
                    options={posterOptions}
                    value={selectedPoster}
                    onChange={setSelectedPoster}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                <button
                  onClick={handleImport}
                  disabled={status === 'saving' || !selectedSlug}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-8 py-4 rounded-full text-sm font-bold text-white shadow-lg shadow-red-600/25"
                >
                  {status === 'saving' ? 'Agregando...' : 'Agregar película'}
                </button>
                {status === 'success' && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <span>✓</span>
                    <span>{message}</span>
                    <span className="text-gray-500 ml-2">
                      Volviendo a la página anterior...
                    </span>
                  </div>
                )}
                {status === 'error' && (
                  <p className="text-red-400 text-sm">{message}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
