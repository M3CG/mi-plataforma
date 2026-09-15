'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
  slug: string;
  tmdbId: number;
}

/**
 * Registra una vista de la película de forma silenciosa (fire-and-forget).
 * Envía el tmdbId para que el BFF pueda crear la película en Strapi
 * si aún no existe.
 */
export default function ViewTracker({ slug, tmdbId }: ViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!slug || !tmdbId || trackedRef.current) return;
    trackedRef.current = true;

    fetch('/api/movies/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, tmdbId }),
    }).catch(() => {
      // Silencioso: el tracking no debe afectar al usuario.
    });
  }, [slug, tmdbId]);

  return null;
}