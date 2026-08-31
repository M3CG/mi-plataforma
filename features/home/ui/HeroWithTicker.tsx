'use client';

import { useEffect, useRef, useState } from 'react';
import type { Movie } from '@/entities/movie';
import HeroRotator from './HeroRotator';
import HomeTicker, {
  INITIAL_PROGRESS,
  TRANSITION_POINT,
  tickerTransform,
} from './HomeTicker';
import ScrollIndicator from './ScrollIndicator';

interface HeroWithTickerProps {
  movies: Movie[];
}

const SLOT_DURATION_MS = 5000;

/**
 * Performance: el avance por frame se escribe directo al DOM
 * (transform del rail) sin setState, para no re-renderizar React
 * a 60fps. Solo `currentIndex` es estado (cambia cada ~5s).
 */
export default function HeroWithTicker({ movies }: HeroWithTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const indexRef = useRef(0);
  const progressRef = useRef(INITIAL_PROGRESS);
  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (movies.length === 0) return;

    const tick = (now: number) => {
      if (lastTickRef.current === null) lastTickRef.current = now;
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      progressRef.current += delta / SLOT_DURATION_MS;
      if (progressRef.current >= TRANSITION_POINT) {
        progressRef.current -= 1;
        indexRef.current = (indexRef.current + 1) % movies.length;
        setCurrentIndex(indexRef.current);
      }
      const rail = railRef.current;
      if (rail) {
        rail.style.transform = tickerTransform(
          movies.length,
          indexRef.current,
          progressRef.current
        );
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        lastTickRef.current = null;
      } else if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [movies.length]);

  if (movies.length === 0) return null;
  return (
    <>
      <HeroRotator movies={movies} currentIndex={currentIndex} />
      <HomeTicker movies={movies} railRef={railRef} />
      <ScrollIndicator />
    </>
  );
}
