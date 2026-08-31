// features/admin-import/model/useImport.ts
'use client';
import { useCallback, useState } from 'react';
import type { ImportStatus } from '../types';

export function useImportMovie() {
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setMessage(null);
  }, []);

  const importMovie = useCallback(
    async (payload: {
      tmdbId: number;
      slug: string;
      posterUrl?: string;
      backdropUrl?: string;
    }) => {
      setStatus('saving');
      setMessage(null);
      try {
        const res = await fetch('/api/admin/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'No se pudo crear la película');
        }
        setStatus('success');
        setMessage(
          `Película creada correctamente (slug: ${data.slug ?? payload.slug}).`
        );
        return true;
      } catch (err) {
        setStatus('error');
        setMessage(
          err instanceof Error ? err.message : 'Error al crear la película'
        );
        return false;
      }
    },
    []
  );

  return { status, message, reset, importMovie };
}

export function useImportActor() {
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setMessage(null);
  }, []);

  const importActor = useCallback(
    async (payload: {
      tmdbId: number;
      slug: string;
      profileImageUrl?: string;
    }) => {
      setStatus('saving');
      setMessage(null);
      try {
        const res = await fetch('/api/admin/actors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'No se pudo crear el actor');
        }
        setStatus('success');
        setMessage(`Actor creado correctamente (slug: ${payload.slug}).`);
        return true;
      } catch (err) {
        setStatus('error');
        setMessage(
          err instanceof Error ? err.message : 'Error al crear el actor'
        );
        return false;
      }
    },
    []
  );

  return { status, message, reset, importActor };
}
