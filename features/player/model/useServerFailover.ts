// features/player/model/useServerFailover.ts
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
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('idle');
  const [autoSwitched, setAutoSwitched] = useState(false);
  const [retryCounter, setRetryCounter] = useState(0);
  const [failedSourceIds, setFailedSourceIds] = useState<Set<string>>(
    () => new Set<string>()
  );

  const failedSourceIdsRef = useRef<Set<string>>(failedSourceIds);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeSource = sources[activeIndex] ?? null;

  useEffect(() => {
    failedSourceIdsRef.current = failedSourceIds;
  }, [failedSourceIds]);

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

  // Protección por si la lista de fuentes cambia y el índice queda fuera de rango.
  useEffect(() => {
    if (sources.length === 0) return;

    if (activeIndex >= sources.length) {
      setActiveIndex(0);
    }
  }, [sources.length, activeIndex]);

  // Timer de carga del servidor activo.
  useEffect(() => {
    clearLoadTimeout();

    if (!activeSource) {
      setLoadStatus('idle');
      return;
    }

    setLoadStatus('loading');

    timeoutRef.current = setTimeout(() => {
      markSourceFailed(activeSource.id);

      const nextIndex = findNextAvailableSource(
        sources,
        activeIndex,
        failedSourceIdsRef.current
      );

      if (nextIndex !== -1) {
        setAutoSwitched(true);
        setActiveIndex(nextIndex);
      } else {
        setLoadStatus('timeout');
      }
    }, timeoutMs);

    return clearLoadTimeout;
  }, [
    activeSource,
    sources,
    activeIndex,
    clearLoadTimeout,
    markSourceFailed,
    retryCounter,
    timeoutMs,
  ]);

  const handleIframeLoad = useCallback(() => {
    clearLoadTimeout();
    setLoadStatus('loaded');
  }, [clearLoadTimeout]);

  const handleRetry = useCallback(() => {
    if (!activeSource) return;

    clearSourceFailed(activeSource.id);
    setAutoSwitched(false);
    setLoadStatus('loading');
    setRetryCounter((previous) => previous + 1);
  }, [activeSource, clearSourceFailed]);

  const handleSelectSource = useCallback(
    (index: number) => {
      const source = sources[index];

      if (!source) return;

      clearSourceFailed(source.id);
      setAutoSwitched(false);

      if (index === activeIndex) {
        // Reintento manual del mismo servidor.
        setLoadStatus('loading');
        setRetryCounter((previous) => previous + 1);
      } else {
        setActiveIndex(index);
      }
    },
    [sources, activeIndex, clearSourceFailed]
  );

  const allFailed = useMemo(() => {
    if (sources.length === 0) return false;

    return sources.every((source) => failedSourceIds.has(source.id));
  }, [sources, failedSourceIds]);

  return {
    sources,
    activeSource,
    activeIndex,
    failedSourceIds,
    loadStatus,
    autoSwitched,
    retryCounter,
    allFailed,

    handleIframeLoad,
    handleRetry,
    handleSelectSource,

    // Lo exponemos por si algún componente visual lo necesita.
    resetFailedSources,
  };
}