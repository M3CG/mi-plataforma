'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { RefObject } from 'react';
import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { routes } from '@/lib/routes';

interface HomeTickerProps {
  movies: Movie[];
  railRef: RefObject<HTMLDivElement | null>;
}

// ─── Geometría de la cinta ───
export const FRAME_WIDTH = 170;
export const FRAME_HEIGHT = 96;
export const FRAME_GAP = 22;
export const UNIT_WIDTH = FRAME_WIDTH + FRAME_GAP;
export const MARKER_POS = 100 / 3;
export const TRANSITION_POINT = (FRAME_WIDTH + FRAME_GAP / 2) / UNIT_WIDTH;
export const INITIAL_PROGRESS = TRANSITION_POINT - 1;

const RAIL_HEIGHT = 34;
const PERF_SIZE = 17;
const PERF_TILE_W = 48;
const COPIES = 5;
const TILT_DEG = 3;
const BORDER_COLOR = 'rgba(255,255,255,0.3)';

/** Transform del rail para índice+progress dados (escritura directa al DOM). */
export function tickerTransform(
  count: number,
  index: number,
  progress: number
): string {
  const offset = (count + index + progress) * UNIT_WIDTH;
  return `translateX(calc(${MARKER_POS}% - ${offset}px))`;
}

const PERF_TILE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='${PERF_TILE_W}' height='${RAIL_HEIGHT}'>` +
    `<rect x='${(PERF_TILE_W - PERF_SIZE) / 2}' y='${(RAIL_HEIGHT - PERF_SIZE) / 2}' width='${PERF_SIZE}' height='${PERF_SIZE}' rx='6' fill='#0a0a0a' stroke='${BORDER_COLOR}' stroke-width='1'/>` +
    `</svg>`
)}`;

const SPINDLE_WIDE =
  'M20 0 C27 20 30 35 30 50 C30 65 27 80 20 100 C13 80 10 65 10 50 C10 35 13 20 20 0 Z';
const SPINDLE_MID =
  'M20 0 C24 20 26 35 26 50 C26 65 24 80 20 100 C16 80 14 65 14 50 C14 35 16 20 20 0 Z';
const SPINDLE_CORE =
  'M20 0 C22 20 23 35 23 50 C23 65 22 80 20 100 C18 80 17 65 17 50 C17 35 18 20 20 0 Z';

function LightBeam() {
  return (
    <svg
      viewBox="0 0 40 100"
      preserveAspectRatio="none"
      className="h-full w-14 overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lb-core" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.12" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="0.88" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lb-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f97316" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fbbf24" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={SPINDLE_WIDE} fill="url(#lb-warm)" style={{ filter: 'blur(6px)' }} />
      <path d={SPINDLE_MID} fill="url(#lb-warm)" style={{ filter: 'blur(2px)' }} />
      <path d={SPINDLE_CORE} fill="url(#lb-core)" />
    </svg>
  );
}

export default function HomeTicker({ movies, railRef }: HomeTickerProps) {
  if (movies.length === 0) return null;
  const repeated = Array.from({ length: COPIES }, () => movies).flat();
  return (
    <div className="relative w-full select-none">
      <div className="h-10 md:h-14" aria-hidden="true" />
      <div
        className="relative z-20"
        style={{
          transform: `rotate(-${TILT_DEG}deg)`,
          transformOrigin: 'left center',
        }}
      >
        <div
          className="relative overflow-hidden bg-red-950"
          style={{ border: `1px solid ${BORDER_COLOR}` }}
        >
          <div
            ref={railRef}
            className="flex will-change-transform"
            style={{
              transform: tickerTransform(movies.length, 0, INITIAL_PROGRESS),
            }}
          >
            {repeated.map((movie, idx) => {
              const backdrop = movie.backdrop_url || movie.poster_url;
              return (
                <div
                  key={`${getMovieKey(movie)}-${idx}`}
                  className="shrink-0"
                  style={{ width: UNIT_WIDTH }}
                >
                  <div
                    style={{
                      height: RAIL_HEIGHT,
                      backgroundImage: `url("${PERF_TILE}")`,
                      backgroundRepeat: 'repeat-x',
                    }}
                  />
                  <div className="flex" style={{ height: FRAME_HEIGHT }}>
                    <Link
                      href={routes.movie(movie.slug)}
                      className="relative block overflow-hidden rounded-md"
                      style={{
                        width: FRAME_WIDTH,
                        height: FRAME_HEIGHT,
                        border: `1px solid ${BORDER_COLOR}`,
                      }}
                    >
                      {backdrop ? (
                        <Image
                          src={backdrop}
                          alt=""
                          fill
                          sizes={`${FRAME_WIDTH}px`}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800" />
                      )}
                    </Link>
                    <div style={{ width: FRAME_GAP }} />
                  </div>
                  <div
                    style={{
                      height: RAIL_HEIGHT,
                      backgroundImage: `url("${PERF_TILE}")`,
                      backgroundRepeat: 'repeat-x',
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div
            className="absolute inset-y-0 left-0 z-20 pointer-events-none"
            style={{
              width: `${MARKER_POS}%`,
              backdropFilter: 'grayscale(1)',
              WebkitBackdropFilter: 'grayscale(1)',
            }}
          />
        </div>
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${MARKER_POS}%`,
            top: '-48px',
            bottom: '-48px',
            transform: 'translateX(-50%)',
          }}
          aria-hidden="true"
        >
          <LightBeam />
        </div>
      </div>
      <div className="h-6 md:h-8" aria-hidden="true" />
    </div>
  );
}
