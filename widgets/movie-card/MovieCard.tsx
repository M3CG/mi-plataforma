'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Movie } from '@/entities/movie';
import { createMovieCardViewModel } from './lib/createMovieCardViewModel';
import { IconImagePlaceholder, IconStar } from '@/shared/ui/icons';
import MovieCardCategoryLink from './MovieCardCategoryLink';

export interface MovieCardProps {
  movie: Movie;
  href: string;
  getCategoryHref?: (categorySlug: string) => string;
  onPrimaryLinkClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  highlightedCategorySlugs?: string[];
}

const IDLE_DELAY_MS = 700;
const SCROLL_END_DELAY_MS = 150;

export default function MovieCard({
  movie,
  href,
  getCategoryHref,
  onPrimaryLinkClick,
  highlightedCategorySlugs,
}: MovieCardProps) {
  const viewModel = createMovieCardViewModel(movie);
  const hasSynopsis =
    Boolean(viewModel.synopsis) && viewModel.synopsis.trim().length > 0;

  // ─── Estado del overlay ───
  const [showOverlay, setShowOverlay] = useState(false);
  const showOverlayRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrollingRef = useRef(false);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouseInsideRef = useRef(false);

  // ─── Mostrar / ocultar overlay ───
  const showOverlayNow = useCallback(() => {
    setShowOverlay(true);
    showOverlayRef.current = true;
  }, []);

  const hideOverlay = useCallback(() => {
    setShowOverlay(false);
    showOverlayRef.current = false;
  }, []);

  // ─── Timer de "mouse quieto" ───
  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      if (mouseInsideRef.current && !isScrollingRef.current) {
        showOverlayNow();
      }
    }, IDLE_DELAY_MS);
  }, [showOverlayNow]);

  const cancelIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  // ─── Handlers de mouse ───
  const handleMouseEnter = useCallback(() => {
    mouseInsideRef.current = true;
    if (!isScrollingRef.current) {
      startIdleTimer();
    }
  }, [startIdleTimer]);

  const handleMouseLeave = useCallback(() => {
    mouseInsideRef.current = false;
    hideOverlay();
    cancelIdleTimer();
  }, [hideOverlay, cancelIdleTimer]);

  const handleMouseMove = useCallback(() => {
    // Si el overlay YA está visible, el movimiento del mouse
    // dentro de la tarjeta NO lo oculta. El usuario puede
    // leer la sinopsis mientras mueve el cursor libremente.
    if (showOverlayRef.current) return;

    // Si el overlay no está visible, cualquier movimiento
    // reinicia el timer de idle.
    if (mouseInsideRef.current && !isScrollingRef.current) {
      startIdleTimer();
    }
  }, [startIdleTimer]);

  // ─── Detectar scroll activo ───
  useEffect(() => {
    const handleScroll = () => {
      isScrollingRef.current = true;
      hideOverlay();
      cancelIdleTimer();

      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }

      scrollEndTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        if (mouseInsideRef.current) {
          startIdleTimer();
        }
      }, SCROLL_END_DELAY_MS);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, [hideOverlay, cancelIdleTimer, startIdleTimer]);

  // ─── Cleanup al desmontar ───
  useEffect(() => {
    return () => {
      cancelIdleTimer();
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, [cancelIdleTimer]);

  return (
    <article
      className="
        group relative
        bg-white/[0.03] border border-white/5
        rounded-2xl overflow-hidden
        transition-all duration-300
        hover:bg-white/[0.06] hover:border-white/10
        hover:shadow-xl hover:shadow-black/20
        hover:-translate-y-1
      "
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <Link
        href={href}
        onClick={onPrimaryLinkClick}
        aria-label={`Ver detalle de ${viewModel.title}`}
        className="absolute inset-0 z-10"
      />

      {/* ─── Imagen + Overlay de sinopsis ─── */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {viewModel.posterUrl ? (
          <Image
            src={viewModel.posterUrl}
            alt={`Póster de ${viewModel.title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1400px) 25vw, 20vw"
            className="
              object-cover
              transition-transform duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <IconImagePlaceholder className="w-10 h-10 text-gray-600" />
          </div>
        )}

        {/* Gradiente hover sutil */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-t from-black/60 via-transparent to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
          "
        />

        {/* ─── Overlay de sinopsis (solo desktop, mouse quieto) ─── */}
        {/* Sticky: una vez visible, el mouse puede moverse libremente
            dentro de la tarjeta sin que desaparezca.
            Solo se oculta con mouseLeave o scroll. */}
        {hasSynopsis && (
          <div
            className={`
              absolute inset-0 z-20
              bg-gray-950/90 backdrop-blur-sm
              flex flex-col justify-end
              p-3.5
              transition-opacity duration-300
              hidden lg:flex
              pointer-events-none
              ${showOverlay ? 'opacity-100' : 'opacity-0'}
            `}
            aria-hidden="true"
          >
            <p className="text-s text-gray-300 leading-relaxed line-clamp-10 overflow-hidden">
              {viewModel.synopsis}
            </p>
          </div>
        )}

        {/* Badges de calidad y subtítulos */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-30">
          {viewModel.primaryQuality && (
            <span
              className="
                bg-red-600/90 backdrop-blur-sm
                text-white text-[10px] font-bold
                px-2 py-0.5 rounded-md
                uppercase tracking-wide
              "
            >
              {viewModel.primaryQuality}
            </span>
          )}
          {viewModel.hasSubtitles && (
            <span
              className="
                bg-black/60 backdrop-blur-sm
                text-gray-200 text-[10px] font-semibold
                px-2 py-0.5 rounded-md
              "
            >
              CC
            </span>
          )}
        </div>

        {/* Rating */}
        {viewModel.rating > 0 && (
          <div
            className="
              absolute top-2.5 right-2.5 z-30
              flex items-center gap-1
              bg-black/70 backdrop-blur-sm
              px-2 py-1 rounded-lg
            "
          >
            <IconStar className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-bold text-white">
              {viewModel.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* ─── Información debajo del poster ─── */}
      <div className="relative p-3.5">
        <h2
          className="
            text-sm font-semibold text-gray-100
            leading-snug line-clamp-2 min-h-[2.5rem]
            group-hover:text-white transition-colors
          "
        >
          {viewModel.title}
        </h2>

        <div className="flex items-center gap-2 mt-1.5 text-xs">
          <span className="text-gray-400">{viewModel.year}</span>
          {viewModel.runtimeLabel && (
            <>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400">
                {viewModel.runtimeLabel}
              </span>
            </>
          )}
          {viewModel.ageRating && (
            <>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400">{viewModel.ageRating}</span>
            </>
          )}
        </div>

        {viewModel.languages.length > 0 && (
          <p className="text-[11px] text-gray-400 mt-1.5 truncate">
            {viewModel.languages.join(' · ')}
          </p>
        )}

        {viewModel.categories.length > 0 && (
          <div className="relative z-20 flex flex-wrap gap-1 mt-2.5">
            {viewModel.categories.map((category) => (
              <MovieCardCategoryLink
                key={category.id}
                category={category}
                href={getCategoryHref?.(category.slug)}
                highlighted={
                  highlightedCategorySlugs?.includes(category.slug) ??
                  false
                }
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
