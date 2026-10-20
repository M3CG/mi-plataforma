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

const STRIP_RAIL_HEIGHT = 34;
const STRIP_PERF_SIZE = 17;
const STRIP_PERF_TILE_W = 48;
const STRIP_BORDER_COLOR = 'rgba(255,255,255,0.3)';

const STRIP_PERF_TILE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='${STRIP_PERF_TILE_W}' height='${STRIP_RAIL_HEIGHT}'>` +
    `<rect x='${(STRIP_PERF_TILE_W - STRIP_PERF_SIZE) / 2}' y='${(STRIP_RAIL_HEIGHT - STRIP_PERF_SIZE) / 2}' width='${STRIP_PERF_SIZE}' height='${STRIP_PERF_SIZE}' rx='6' fill='#000F20' stroke='${STRIP_BORDER_COLOR}' stroke-width='1'/>` +
    `</svg>`
)}`;

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

      <div className="flex items-center gap-2 md:gap-3">
        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label={`Scroll ${title} left`}
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

        {/* Contenedor de la cinta con degradados de inicio y fin */}
        <div className="relative flex-1 min-w-0 overflow-hidden">
          <div
            className="
              absolute left-0 top-0 bottom-0 z-20
              w-8 sm:w-12 md:w-16
              bg-gradient-to-r from-[#000F20] via-[#000F20]/85 to-transparent
              pointer-events-none
            "
            aria-hidden="true"
          />

          <div
            className="
              absolute right-0 top-0 bottom-0 z-20
              w-8 sm:w-12 md:w-16
              bg-gradient-to-l from-[#000F20] via-[#000F20]/85 to-transparent
              pointer-events-none
            "
            aria-hidden="true"
          />

          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide"
          >
            <div
              className="flex bg-red-950 px-5 sm:px-7 md:px-10"
              style={{
                borderTop: `1px solid ${STRIP_BORDER_COLOR}`,
                borderBottom: `1px solid ${STRIP_BORDER_COLOR}`,
              }}
            >
              {movies.slice(0, 15).map((movie) => (
                <div
                  key={getMovieKey(movie)}
                  className="shrink-0 w-44 sm:w-48 md:w-52 lg:w-56"
                >
                  {/* Riel superior de perforaciones */}
                  <div
                    style={{
                      height: STRIP_RAIL_HEIGHT,
                      backgroundImage: `url("${STRIP_PERF_TILE}")`,
                      backgroundRepeat: 'repeat-x',
                    }}
                  />

                  {/* Fotograma 2:3 (solo foto) + banda inferior más alta para título y año */}
                  <div className="px-2.5 md:px-3 pt-1.5 pb-2.5">
                    <Link
                      href={routes.movie(movie.slug)}
                      className="
                        group block outline-none rounded-md
                        focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-red-950
                      "
                    >
                      <div
                        className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-[#000F20]"
                        style={{ border: `1px solid ${STRIP_BORDER_COLOR}` }}
                      >
                        {movie.poster_url ? (
                          <Image
                            src={movie.poster_url}
                            alt={`${movie.title} poster`}
                            fill
                            sizes="(max-width: 640px) 176px, (max-width: 1024px) 208px, 224px"
                            className="
                              object-cover
                              transition-transform duration-300
                              group-hover:scale-105
                              group-focus-visible:scale-105
                            "
                          />
                        ) : (
                          <div className="w-full h-full bg-white/5" />
                        )}
                      </div>

                      <div className="pt-3 pb-1 px-1 text-left">
                        <h3
                          className="
                            text-sm md:text-[15px] font-semibold text-gray-200
                            group-hover:text-white group-focus-visible:text-white
                            transition-colors truncate
                          "
                        >
                          {movie.title}
                        </h3>
                        <p className="text-xs text-red-200/70 mt-0.5">
                          {movie.year}
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Riel inferior de perforaciones */}
                  <div
                    style={{
                      height: STRIP_RAIL_HEIGHT,
                      backgroundImage: `url("${STRIP_PERF_TILE}")`,
                      backgroundRepeat: 'repeat-x',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flecha derecha */}
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label={`Scroll ${title} right`}
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
