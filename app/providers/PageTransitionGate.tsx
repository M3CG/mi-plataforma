// app/providers/PageTransitionGate.tsx
'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const MIN_PAGE_DURATION_MS = 100;
const FADE_OUT_MS = 150;

type GatePhase = 'idle' | 'visible' | 'fading';

export default function PageTransitionGate() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<GatePhase>('idle');

  const intentAtRef = useRef<number | null>(null);
  const lastPathnameRef = useRef(pathname);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const registerIntent = () => {
      intentAtRef.current = performance.now();
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[href]') as
        | HTMLAnchorElement
        | null
        | undefined;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/')) return;
      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download')
      ) {
        return;
      }
      registerIntent();
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', registerIntent, true);
    window.addEventListener('popstate', registerIntent);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', registerIntent, true);
      window.removeEventListener('popstate', registerIntent);
    };
  }, []);

  useLayoutEffect(() => {
    if (lastPathnameRef.current === pathname) return;
    lastPathnameRef.current = pathname;

    const startedAt = intentAtRef.current;
    intentAtRef.current = null;

    const elapsed =
      startedAt === null ? 0 : performance.now() - startedAt;
    const remaining = MIN_PAGE_DURATION_MS - elapsed;

    if (remaining <= 0) return;

    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];

    setPhase('visible');

    const hideTimer = window.setTimeout(() => {
      setPhase('fading');
      const doneTimer = window.setTimeout(() => {
        setPhase('idle');
      }, FADE_OUT_MS);
      timersRef.current.push(doneTimer);
    }, remaining);
    timersRef.current.push(hideTimer);
  }, [pathname]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) =>
        window.clearTimeout(timer)
      );
    };
  }, []);

  if (phase === 'idle') return null;

  return (
    <div
      role="status"
      aria-label="Loading page"
      className={`fixed inset-0 z-[80] bg-[#000F20] flex flex-col items-center justify-center gap-4 ${
        phase === 'visible'
          ? 'opacity-100'
          : 'opacity-0 pointer-events-none transition-opacity duration-150 ease-out'
      }`}
    >
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  );
}
