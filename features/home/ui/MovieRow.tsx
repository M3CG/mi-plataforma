'use client';

import { useRef } from 'react';
import Link from 'next/link';
import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { AppMovieCard } from '@/widgets/movie-card';
import { IconBack } from '@/shared/ui/icons';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  linkHref?: string;
  linkLabel?: string;
  /** Muestra un número de ranking grande junto a cada tarjeta. */
  showRank?: boolean;
}

export default function MovieRow({
  title,
  movies,
  linkHref,
  linkLabel,
  showRank = false,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: number) => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({
      left: direction * node.clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  return (
    <section className="group/row">
      <div className="flex items-center justify-between mb-3 px-4 md:px-8">
        <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
        {linkHref && linkLabel && (
          <Link
            href={linkHref}
            className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors"
          >
            {linkLabel} →
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={`Desplazar ${title} hacia la izquierda`}
          className="hidden md:flex absolute left-0 top-0 bottom-0 z-20 w-10 items-center justify-center bg-gradient-to-r from-gray-900 to-transparent text-white opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <IconBack className="w-6 h-6" />
        </button>

        {/*
          Cuando showRank está activo, agregamos padding superior (pt-10).
          Sin esto, el overflow-x-auto del carrusel fuerza overflow-y:auto
          y recorta los números que sobresalen por encima de las tarjetas.
        */}
        <div
          ref={scrollRef}
          className={`flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-2 ${
            showRank ? 'pt-10' : ''
          }`}
        >
          {movies.map((movie, index) => (
            <div
              key={getMovieKey(movie)}
              className="flex-shrink-0 w-36 sm:w-40 md:w-44 relative"
            >
              {showRank && (
                <span
                  aria-hidden="true"
                  className="absolute -left-2 -top-7 z-10 text-6xl font-extrabold text-transparent select-none pointer-events-none"
                  style={{ WebkitTextStroke: '2px rgba(255,255,255,0.35)' }}
                >
                  {index + 1}
                </span>
              )}
              <AppMovieCard movie={movie} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={`Desplazar ${title} hacia la derecha`}
          className="hidden md:flex absolute right-0 top-0 bottom-0 z-20 w-10 items-center justify-center bg-gradient-to-l from-gray-900 to-transparent text-white opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <IconBack className="w-6 h-6 rotate-180" />
        </button>
      </div>
    </section>
  );
}
