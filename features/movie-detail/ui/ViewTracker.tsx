'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
  slug: string;
}

/**
 * Registra una vista de la película de forma silenciosa (fire-and-forget).
 * Si la petición falla, no interrumpe la experiencia del usuario.
 */
export default function ViewTracker({ slug }: ViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!slug || trackedRef.current) return;
    trackedRef.current = true;

    fetch('/api/movies/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => {
      // Silencioso: el tracking no debe afectar al usuario.
    });
  }, [slug]);

  return null;
}
