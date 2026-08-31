// features/admin-import/ui/ActorImportDetail.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import BackButton from '@/shared/ui/BackButton';
import type {
  FilmographyMovie,
} from '../types';
import { usePersonPreview } from '../model/usePersonPreview';
import { usePersonFilmography } from '../model/usePersonFilmography';
import { useImportActor } from '../model/useImport';
import SlugSelector from './SlugSelector';
import PosterSelector from './PosterSelector';

interface ActorImportDetailProps {
  tmdbId: number;
}

function FilmographyGrid({
  title,
  movies,
}: {
  title: string;
  movies: FilmographyMovie[];
}) {
  if (movies.length === 0) return null;
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">
        {title}{' '}
        <span className="text-sm font-normal text-gray-500">
          ({movies.length} titles — click for details)
        </span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {movies.map((movie) => (
          <Link
            key={`${movie.tmdbId}-${movie.role}`}
            href={`/admin/import/movie/${movie.tmdbId}`}
            className="group relative bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden hover:border-red-500/40 hover:bg-white/[0.06] transition-all hover:-translate-y-0.5"
          >
            <div className="relative aspect-[2/3] bg-white/5">
              {movie.posterUrl ? (
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  sizes="150px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-2xl">
                  🎬
                </div>
              )}
              {movie.inDatabase && (
                <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded bg-green-600/90 text-white font-bold shadow-md">
                  EN DB
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-2 left-2 right-2 text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">
                View details →
              </span>
            </div>
            <div className="p-2.5">
              <h4 className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-white transition-colors">
                {movie.title}
              </h4>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500">
                {movie.year && <span>{movie.year}</span>}
                <span className="text-gray-600">·</span>
                <span className="text-gray-400 line-clamp-1">
                  {movie.role}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ActorImportDetail({
  tmdbId,
}: ActorImportDetailProps) {
  const router = useRouter();
  const { preview, slugCandidates, isLoading, error, load } =
    usePersonPreview();
  const filmography = usePersonFilmography();
  const { status, message, importActor } = useImportActor();

  const [selectedSlug, setSelectedSlug] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState('');

  useEffect(() => {
    load(tmdbId);
    filmography.load(tmdbId);
  }, [tmdbId, load, filmography.load]);

  useEffect(() => {
    if (preview) {
      const recommended =
        slugCandidates.find((c) => c.recommended) ??
        slugCandidates.find((c) => !c.taken) ??
        slugCandidates[0];
            // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSlug(recommended?.slug ?? '');
      setSelectedPhoto(preview.defaultProfileUrl ?? '');
    }
  }, [preview, slugCandidates]);

  // Redirigir después de éxito: volver a la página anterior
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
          <p className="text-gray-400">Loading actor...</p>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {error ?? 'Actor not found'}
          </p>
          <BackButton fallbackHref="/admin/import" />
        </div>
      </div>
    );
  }

  const photoOptions = preview.profiles.map((p) => ({ url: p.url }));

  const handleImport = () => {
    importActor({
      tmdbId: preview.tmdbId,
      slug: selectedSlug,
      profileImageUrl: selectedPhoto,
    });
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <BackButton fallbackHref="/admin/import" />
          <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
            Local development only
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10">
              {preview.defaultProfileUrl ? (
                <Image
                  src={preview.defaultProfileUrl}
                  alt={preview.name}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-600 text-4xl">
                  👤
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{preview.name}</h1>
            {preview.knownForDepartment && (
              <p className="text-sm text-gray-400 mt-1">
                {preview.knownForDepartment}
              </p>
            )}
            {preview.biography && (
              <p className="text-sm text-gray-500 mt-3 line-clamp-4 leading-relaxed">
                {preview.biography}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">
            Add to the database
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-200 mb-3">
                Slug
              </h3>
              <SlugSelector
                candidates={slugCandidates}
                value={selectedSlug}
                onChange={setSelectedSlug}
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-200 mb-3">
                Profile photo
              </h3>
              <PosterSelector
                options={photoOptions}
                value={selectedPhoto}
                onChange={setSelectedPhoto}
                aspectClassName="aspect-square"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5">
            <button
              onClick={handleImport}
              disabled={status === 'saving' || !selectedSlug}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-8 py-4 rounded-full text-sm font-bold text-white shadow-lg shadow-red-600/25"
            >
              {status === 'saving' ? 'Adding...' : 'Add actor'}
            </button>
            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <span>✓</span>
                <span>{message}</span>
                <span className="text-gray-500 ml-2">
                  Returning to the previous page...
                </span>
              </div>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-sm">{message}</p>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <h2 className="text-2xl font-bold text-white">
            TMDB filmography
          </h2>
          <p className="text-sm text-gray-400 -mt-2">
            Click any movie to see its details and add it to the catalog.
          </p>

          {filmography.isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-red-600/60 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-400">
                Loading filmography...
              </span>
            </div>
          )}

          {filmography.error && (
            <p className="text-red-400 text-center py-8">
              {filmography.error}
            </p>
          )}

          {!filmography.isLoading && !filmography.error && (
            <>
              <FilmographyGrid
                title="As actor/actress"
                movies={filmography.castMovies}
              />
              <FilmographyGrid
                title="As crew (direction, production, etc.)"
                movies={filmography.crewMovies}
              />
              {filmography.castMovies.length === 0 &&
                filmography.crewMovies.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No movies found for this person.
                  </p>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
