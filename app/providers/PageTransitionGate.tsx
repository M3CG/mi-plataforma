// app/providers/PageTransitionGate.tsx
'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Duración mínima percibida de cada navegación entre páginas (ms).
 *
 * El sitio responde tan rápido que muchas transiciones son
 * instantáneas (prefetch + router cache). Eso genera dos problemas:
 *
 * 1. El usuario no percibe que cambió de página.
 * 2. Los tiempos son inconsistentes: 0 ms, 200 ms, 400 ms...
 *    El usuario no lo detecta conscientemente, pero se siente.
 *
 * Este componente garantiza un mínimo uniforme por navegación:
 * si la transición terminó antes del mínimo, muestra un overlay de
 * carga por el tiempo restante. Si tardó más (fetch real lento),
 * no agrega nada: el skeleton de la ruta ya cubrió ese tiempo.
 *
 * Resultado: toda navegación dura max(tiempoReal, MIN_PAGE_DURATION_MS).
 */
const MIN_PAGE_DURATION_MS = 900;
const FADE_OUT_MS = 150;

type GatePhase = 'idle' | 'visible' | 'fading';

export default function PageTransitionGate() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<GatePhase>('idle');

  // Momento en que el usuario inició la navegación.
  const intentAtRef = useRef<number | null>(null);
  // Última ruta procesada (evita disparar en mount / strict mode).
  const lastPathnameRef = useRef(pathname);
  const timersRef = useRef<number[]>([]);

  // ─── Registrar el inicio de cada navegación ───
  // Click en links internos, submit de formularios (búsqueda)
  // y popstate (back/forward). Links externos, con modificadores
  // o target=_blank se ignoran.
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

  // ─── Completar el mínimo cuando cambia la ruta ───
  //
  // useLayoutEffect (no useEffect): el overlay debe pintarse en el
  // mismo frame que la página nueva; con useEffect el contenido
  // nuevo flashea un instante antes de taparse.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useLayoutEffect(() => {
    // Sin cambio real de ruta (mount, re-render, strict mode).
    if (lastPathnameRef.current === pathname) return;
    lastPathnameRef.current = pathname;

    const startedAt = intentAtRef.current;
    intentAtRef.current = null;

    // Sin evento registrado (navegación programática sin click):
    // el mínimo se cuenta desde que la página nueva quedó montada.
    const elapsed =
      startedAt === null ? 0 : performance.now() - startedAt;
    const remaining = MIN_PAGE_DURATION_MS - elapsed;

    // La transición ya tardó más que el mínimo: el skeleton real
    // cubrió el tiempo, no agregar carga artificial.
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

  // ─── Limpieza de timers al desmontar ───
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
      className={`fixed inset-0 z-[80] bg-gray-900 flex flex-col items-center justify-center gap-4 ${
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