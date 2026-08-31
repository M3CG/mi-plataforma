'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { routes } from '@/lib/routes';
import { IconBack } from '@/shared/ui/icons';
import SectionHeader from './SectionHeader';

interface MovieStripProps {
  title: string;
  movies: Movie[];
  href?: string;
}

/**
 * Cinta horizontal minimalista con scroll lateral.
 *
 * Estructura visual:
 *   [←]  ▓░░[poster][poster][poster]░░▓  [→]
 *         fade                      fade
 *
 * Las flechas están fuera del área de posters (elementos flex).
 * El fade solo toca el borde de la cinta, no cubre los posters.
 */
export default function MovieStrip({
  title,
  movies,
  href = routes.movies,
}: MovieStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: number) => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({
      left: direction * node.clientWidth * 0.8,
      behavior: 'smooth',
    });
  };

  if (movies.length === 0) return null;

  return (
    <section>
      <SectionHeader title={title} href={href} />

      {/* ─── Layout: flecha | fade+cinta+fade | flecha ─── */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Flecha izquierda (fuera de la cinta) */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={`Desplazar ${title} hacia la izquierda`}
          className="
            hidden md:flex flex-shrink-0
            w-9 h-9 items-center justify-center
            rounded-full
            bg-white/5 border border-white/10
            text-gray-500
            hover:text-white hover:bg-white/10 hover:border-white/20
            transition-all duration-200
          "
        >
          <IconBack className="w-4 h-4" />
        </button>

        {/* Contenedor que recorta + fades en los bordes */}
        <div className="relative flex-1 min-w-0 overflow-hidden">
          {/* Fade izquierdo: solo toca el borde de la cinta */}
          <div
            className="
              absolute left-0 top-0 bottom-0 z-10
              w-4 md:w-6
              bg-gradient-to-r from-[#0a0a0a] to-transparent
              pointer-events-none
            "
            aria-hidden="true"
          />
          {/* Fade derecho: solo toca el borde de la cinta */}
          <div
            className="
              absolute right-0 top-0 bottom-0 z-10
              w-4 md:w-6
              bg-gradient-to-l from-[#0a0a0a] to-transparent
              pointer-events-none
            "
            aria-hidden="true"
          />

          {/* Scroll horizontal */}
          <div
            ref={scrollRef}
            className="flex gap-5 md:gap-6 overflow-x-auto scrollbar-hide pb-2"
          >
            {movies.slice(0, 15).map((movie) => (
              <Link
                key={getMovieKey(movie)}
                href={routes.movie(movie.slug)}
                className="group w-44 sm:w-48 md:w-52 lg:w-56 shrink-0"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5">
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={`Póster de ${movie.title}`}
                      fill
                      sizes="(max-width: 640px) 176px, (max-width: 1024px) 208px, 224px"
                      className="
                        object-cover
                        transition-opacity duration-300
                        group-hover:opacity-80
                      "
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5" />
                  )}
                </div>
                <h3
                  className="
                    mt-3 text-sm md:text-base text-gray-300
                    group-hover:text-white transition-colors truncate
                  "
                >
                  {movie.title}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {movie.year}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Flecha derecha (fuera de la cinta) */}
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={`Desplazar ${title} hacia la derecha`}
          className="
            hidden md:flex flex-shrink-0
            w-9 h-9 items-center justify-center
            rounded-full
            bg-white/5 border border-white/10
            text-gray-500
            hover:text-white hover:bg-white/10 hover:border-white/20
            transition-all duration-200
          "
        >
          <IconBack className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </section>
  );
}