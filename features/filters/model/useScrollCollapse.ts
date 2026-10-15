// features/filters/model/useScrollCollapse.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseScrollCollapseOptions {
  /** Posición máxima de la página (px) donde la barra siempre está visible. */
  hideAfter?: number;
  /** Arrastre acumulado hacia ABAJO (px) necesario para ocultar la barra. */
  hideDelta?: number;
  /** Arrastre acumulado hacia ARRIBA (px) necesario para mostrarla de nuevo. */
  showDelta?: number;
  /** Salto de un solo frame (px) considerado programático (no alterna estado). */
  teleportThreshold?: number;
}

const DEFAULT_HIDE_AFTER = 200;
const DEFAULT_HIDE_DELTA = 100;
const DEFAULT_SHOW_DELTA = 80;
const DEFAULT_TELEPORT_THRESHOLD = 250;

export interface ScrollCollapseFrame {
  /** scrollY actual. */
  y: number;
  /** Diferencia con el frame anterior (positiva = hacia abajo). */
  frameDelta: number;
  /** scrollY mínimo del gesto (punto más alto de la página). */
  startY: number;
  /** scrollY máximo del gesto (punto más bajo de la página). */
  peakY: number;
}

export interface ScrollCollapseThresholds {
  hideAfter: number;
  hideDelta: number;
  showDelta: number;
  teleportThreshold: number;
}

export type ScrollCollapseToggle = 'hide' | 'show' | null;

export interface ScrollCollapseDecision {
  toggle: ScrollCollapseToggle;
  startY: number;
  peakY: number;
}

/**
 * Decisión pura de colapso por frame.
 *
 * Usa histéresis por extremos: acumula el punto más alto (startY) y
 * más bajo (peakY) del gesto, y solo alterna el estado cuando el
 * arrastre sostenido supera el umbral correspondiente. Las micro
 * reversiones del scroll táctil no reinician la acumulación.
 *
 * Al alternar el estado (o al llegar al tope de la página) ambas
 * referencias se reinician en la posición actual: el próximo gesto
 * se mide desde el punto de alternancia.
 */
export function decideScrollCollapse(
  frame: ScrollCollapseFrame,
  thresholds: ScrollCollapseThresholds
): ScrollCollapseDecision {
  const { y, frameDelta, startY, peakY } = frame;
  const { hideAfter, hideDelta, showDelta, teleportThreshold } =
    thresholds;

  // Salto en un solo frame = scroll programático (restauración de
  // posición del grid, scrollTo, etc.): re-baselinear sin alternar.
  if (Math.abs(frameDelta) > teleportThreshold) {
    return { toggle: null, startY: y, peakY: y };
  }

  // Cerca del tope de la página la barra siempre está visible.
  if (y <= hideAfter) {
    return { toggle: 'show', startY: y, peakY: y };
  }

  const nextStartY = Math.min(startY, y);
  const nextPeakY = Math.max(peakY, y);

  // Arrastre sostenido hacia abajo → ocultar.
  if (y - nextStartY >= hideDelta) {
    return { toggle: 'hide', startY: y, peakY: y };
  }

  // Arrastre sostenido hacia arriba → mostrar.
  if (nextPeakY - y >= showDelta) {
    return { toggle: 'show', startY: y, peakY: y };
  }

  return { toggle: null, startY: nextStartY, peakY: nextPeakY };
}

/**
 * Decide si la barra de filtros debe colapsarse según el gesto de scroll.
 *
 * En celulares el scroll rebota unos pocos píxeles (overscroll elástico,
 * la barra de navegación del sistema, etc.). La versión anterior
 * alternaba el estado con deltas de 1-5 px y eso producía el parpadeo
 * de "se muestra y se oculta" en períodos muy breves.
 *
 * Ahora hace falta un arrastre sostenido (~100 px hacia abajo para
 * ocultar, ~80 px hacia arriba para mostrar) antes de alternar.
 */
export function useScrollCollapse(
  options?: UseScrollCollapseOptions
): boolean {
  const hideAfter = options?.hideAfter ?? DEFAULT_HIDE_AFTER;
  const hideDelta = options?.hideDelta ?? DEFAULT_HIDE_DELTA;
  const showDelta = options?.showDelta ?? DEFAULT_SHOW_DELTA;
  const teleportThreshold =
    options?.teleportThreshold ?? DEFAULT_TELEPORT_THRESHOLD;

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extremos del gesto actual. Null hasta el primer frame.
  const startYRef = useRef<number | null>(null);
  const peakYRef = useRef<number | null>(null);
  const lastYRef = useRef<number | null>(null);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;

    window.requestAnimationFrame(() => {
      ticking.current = false;

      const y = window.scrollY;
      const startY = startYRef.current;
      const peakY = peakYRef.current;
      const lastY = lastYRef.current;

      // Primer frame: línea base, sin decidir nada.
      // Cubre también el regreso al catálogo con scroll restaurado.
      if (startY === null || peakY === null || lastY === null) {
        startYRef.current = y;
        peakYRef.current = y;
        lastYRef.current = y;
        return;
      }

      const decision = decideScrollCollapse(
        { y, frameDelta: y - lastY, startY, peakY },
        { hideAfter, hideDelta, showDelta, teleportThreshold }
      );

      lastYRef.current = y;
      startYRef.current = decision.startY;
      peakYRef.current = decision.peakY;

      if (decision.toggle === 'hide') {
        setIsCollapsed(true);
      } else if (decision.toggle === 'show') {
        setIsCollapsed(false);
      }
    });
  }, [hideAfter, hideDelta, showDelta, teleportThreshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return isCollapsed;
}