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
  enabled?: boolean;
}

export function useServerFailover({
  sources,
  timeoutMs = LOAD_TIMEOUT_MS,
  enabled = true,
}: UseServerFailoverProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [internalLoadStatus, setInternalLoadStatus] =
    useState<LoadStatus>('idle');
  const [autoSwitched, setAutoSwitched] = useState(false);
  const [retryCounter, setRetryCounter] = useState(0);
  const [failedSourceIds, setFailedSourceIds] = useState<Set<string>>(
    () => new Set<string>()
  );

  const failedSourceIdsRef = useRef<Set<string>>(failedSourceIds);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef<boolean>(enabled);

  useEffect(() => {
    failedSourceIdsRef.current = failedSourceIds;
  }, [failedSourceIds]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const safeActiveIndex =
    sources.length > 0 && activeIndex >= sources.length ? 0 : activeIndex;

  const activeSource = sources[safeActiveIndex] ?? null;

  const effectiveLoadStatus: LoadStatus = useMemo(() => {
    if (!activeSource || !enabled) return 'idle';
    if (internalLoadStatus === 'idle') return 'loading';
    return internalLoadStatus;
  }, [activeSource, enabled, internalLoadStatus]);

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

  // Timer de carga del servidor activo: usa enabledRef para evaluar sin alterar el tamaño del array de dependencias
  useEffect(() => {
    clearLoadTimeout();

    if (!activeSource) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      if (!enabledRef.current) return;

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
        setInternalLoadStatus(enabledRef.current ? 'loading' : 'idle');
        setRetryCounter((previous) => previous + 1);
      } else {
        setActiveIndex(index);
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