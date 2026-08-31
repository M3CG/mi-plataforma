'use client';

import { useEffect, useRef, useState } from 'react';
import VideoPlayer from './VideoPlayer';
import type { PlayableSource } from '../types';

interface LazyVideoPlayerProps {
  sources: PlayableSource[];
  rootMargin?: string;
}

/**
 * Monta el VideoPlayer recién cuando la sección se acerca al viewport.
 * El iframe de terceros (y su failover) no compiten con el LCP del hero.
 */
export default function LazyVideoPlayer({
  sources,
  rootMargin = '300px',
}: LazyVideoPlayerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref}>
      {visible ? (
        <VideoPlayer sources={sources} />
      ) : (
        <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
          <p className="text-sm text-gray-600">
            The player loads as you approach this section.
          </p>
        </div>
      )}
    </div>
  );
}
