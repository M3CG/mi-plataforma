'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { LoadStatus, PlayableSource } from '../types';
import { LOAD_TIMEOUT_MS } from '../config/player';
import { findNextAvailableSource } from '../lib/findNextAvailableSource';

interface UseServerFailoverProps {
  sources: PlayableSource[];
  timeoutMs?: number;
}

export function useServerFailover({
  sources,
  timeoutMs = LOAD_TIMEOUT_MS,
}: UseServerFailoverProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Estado interno que solo cambia por eventos explícitos:
  // - 'loaded'   cuando el iframe carga
  // - 'timeout'  cuando expira el timer
  // - 'loading'  cuando el usuario reintenta o cambia de servidor
  // El estado 'idle' se deriva cuando no hay fuente activa.
  const [internalLoadStatus, setInternalLoadStatus] =
    useState<LoadStatus>('idle');
  const [autoSwitched, setAutoSwitched] = useState(false);
  const [retryCounter, setRetryCounter] = useState(0);
  const [failedSourceIds, setFailedSourceIds] = useState<Set<string>>(
    () => new Set<string>()
  );

  const failedSourceIdsRef = useRef<Set<string>>(failedSourceIds);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    failedSourceIdsRef.current = failedSourceIds;
  }, [failedSourceIds]);

  // ─── Derivación durante render ───
  // Si la lista de fuentes cambia y activeIndex queda fuera de rango,
  // derivamos un índice seguro sin usar efecto + setState.
  const safeActiveIndex =
    sources.length > 0 && activeIndex >= sources.length ? 0 : activeIndex;

  const activeSource = sources[safeActiveIndex] ?? null;

  // Estado efectivo derivado:
  // - Sin fuente activa  → 'idle'
  // - Con fuente activa  → lo que diga internalLoadStatus,
  //   pero si está en 'idle' por defecto, asumimos 'loading'
  //   (porque tener una fuente implica que estamos intentando cargar).
  const effectiveLoadStatus: LoadStatus = useMemo(() => {
    if (!activeSource) return 'idle';
    if (internalLoadStatus === 'idle') return 'loading';
    return internalLoadStatus;
  }, [activeSource, internalLoadStatus]);

  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const markSourceFailed = useCallback((sourceId: string) => {
    const next = new Set(failedSourceIdsRef.current);
    next.add(sourceId);
    failedSourceIdsRef.current = next;
    setFailedSourceIds(next);
  }, []);

  const clearSourceFailed = useCallback((sourceId: string) => {
    const next = new Set(failedSourceIdsRef.current);
    next.delete(sourceId);
    failedSourceIdsRef.current = next;
    setFailedSourceIds(next);
  }, []);

  const resetFailedSources = useCallback(() => {
    const next = new Set<string>();
    failedSourceIdsRef.current = next;
    setFailedSourceIds(next);
  }, []);

  // Timer de carga del servidor activo.
  // Este efecto SOLO configura el timer de failover.
  // No cambia loadStatus: el estado se deriva durante el render.
  useEffect(() => {
    clearLoadTimeout();

    if (!activeSource) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      markSourceFailed(activeSource.id);

      const nextIndex = findNextAvailableSource(
        sources,
        safeActiveIndex,
        failedSourceIdsRef.current
      );

      if (nextIndex !== -1) {
        setAutoSwitched(true);
        setActiveIndex(nextIndex);
      } else {
        setInternalLoadStatus('timeout');
      }
    }, timeoutMs);

    return clearLoadTimeout;
  }, [
    activeSource,
    sources,
    safeActiveIndex,
    clearLoadTimeout,
    markSourceFailed,
    retryCounter,
    timeoutMs,
  ]);

  const handleIframeLoad = useCallback(() => {
    clearLoadTimeout();
    setInternalLoadStatus('loaded');
  }, [clearLoadTimeout]);

  const handleRetry = useCallback(() => {
    if (!activeSource) return;

    clearSourceFailed(activeSource.id);
    setAutoSwitched(false);
    setInternalLoadStatus('loading');
    setRetryCounter((previous) => previous + 1);
  }, [activeSource, clearSourceFailed]);

  const handleSelectSource = useCallback(
    (index: number) => {
      const source = sources[index];
      if (!source) return;

      clearSourceFailed(source.id);
      setAutoSwitched(false);

      if (index === safeActiveIndex) {
        // Reintento manual del mismo servidor.
        setInternalLoadStatus('loading');
        setRetryCounter((previous) => previous + 1);
      } else {
        setActiveIndex(index);
        // Al cambiar de fuente, el estado derivado
        // pasará automáticamente a 'loading'.
        setInternalLoadStatus('idle');
      }
    },
    [sources, safeActiveIndex, clearSourceFailed]
  );

  const allFailed = useMemo(() => {
    if (sources.length === 0) return false;
    return sources.every((source) => failedSourceIds.has(source.id));
  }, [sources, failedSourceIds]);

  return {
    sources,
    activeSource,
    activeIndex: safeActiveIndex,
    failedSourceIds,
    loadStatus: effectiveLoadStatus,
    autoSwitched,
    retryCounter,
    allFailed,
    handleIframeLoad,
    handleRetry,
    handleSelectSource,
    resetFailedSources,
  };
}
