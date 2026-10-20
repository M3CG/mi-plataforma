// features/filters/model/useScrollCollapse.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ScrollCollapseStepInput {
  y: number;
  frameDelta: number;
  startY: number;
  peakY: number;
}

export interface ScrollCollapseThresholds {
  hideAfter: number;
  hideDelta: number;
  showDelta: number;
  teleportThreshold: number;
}

export interface ScrollCollapseDecision {
  startY: number;
  peakY: number;
  toggle: 'hide' | 'show' | null;
}

export function decideScrollCollapse(
  input: ScrollCollapseStepInput,
  thresholds: ScrollCollapseThresholds
): ScrollCollapseDecision {
  const { y, frameDelta, startY, peakY } = input;
  const { hideAfter, hideDelta, showDelta, teleportThreshold } = thresholds;

  if (Math.abs(frameDelta) >= teleportThreshold) {
    return { startY: y, peakY: y, toggle: null };
  }

  if (y <= hideAfter) {
    return { startY: y, peakY: y, toggle: 'show' };
  }

  const nextStartY = Math.min(startY, y);
  const nextPeakY = Math.max(peakY, y);

  if (frameDelta > 0 && y - nextStartY >= hideDelta) {
    return { startY: y, peakY: y, toggle: 'hide' };
  }

  if (frameDelta < 0 && nextPeakY - y >= showDelta) {
    return { startY: y, peakY: y, toggle: 'show' };
  }

  return { startY: nextStartY, peakY: nextPeakY, toggle: null };
}

interface UseScrollCollapseOptions {
  hideAfter?: number;
  collapseThreshold?: number;
  expandThreshold?: number;
  settleMs?: number;
}

export function useScrollCollapse(
  options?: UseScrollCollapseOptions
): boolean {
  const hideAfter = options?.hideAfter ?? 150;
  const collapseThreshold = options?.collapseThreshold ?? 32;
  const expandThreshold = options?.expandThreshold ?? 32;
  const settleMs = options?.settleMs ?? 400;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const collapsedRef = useRef(false);
  const anchorYRef = useRef(0);
  const lastChangeAtRef = useRef(-Infinity);
  const tickingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;

    window.requestAnimationFrame(() => {
      tickingRef.current = false;

      const currentY = window.scrollY;
      const now = performance.now();

      if (now - lastChangeAtRef.current < settleMs) {
        anchorYRef.current = collapsedRef.current
          ? Math.max(anchorYRef.current, currentY)
          : Math.min(anchorYRef.current, currentY);
        return;
      }

      if (collapsedRef.current && currentY <= hideAfter) {
        collapsedRef.current = false;
        lastChangeAtRef.current = now;
        anchorYRef.current = currentY;
        setIsCollapsed(false);
        return;
      }

      if (!collapsedRef.current) {
        anchorYRef.current = Math.min(anchorYRef.current, currentY);

        if (
          currentY - anchorYRef.current >= collapseThreshold &&
          currentY > hideAfter
        ) {
          collapsedRef.current = true;
          lastChangeAtRef.current = now;
          anchorYRef.current = currentY;
          setIsCollapsed(true);
        }
      } else {
        anchorYRef.current = Math.max(anchorYRef.current, currentY);

        if (anchorYRef.current - currentY >= expandThreshold) {
          collapsedRef.current = false;
          lastChangeAtRef.current = now;
          anchorYRef.current = currentY;
          setIsCollapsed(false);
        }
      }
    });
  }, [hideAfter, collapseThreshold, expandThreshold, settleMs]);

  useEffect(() => {
    anchorYRef.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return isCollapsed;
}
