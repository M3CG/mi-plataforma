// features/filters/model/useScrollCollapse.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseScrollCollapseOptions {
  /** Scroll mínimo desde el top para que el colapso pueda activarse. */
  hideAfter?: number;
  /** Px que hay que arrastrar hacia abajo para ocultar los controles. */
  collapseThreshold?: number;
  /** Px que hay que arrastrar hacia arriba para volver a mostrarlos. */
  expandThreshold?: number;
  /** Ms de "cuarentena" tras cada cambio de estado para asentar el layout. */
  settleMs?: number;
}

/**
 * Colapsa/expande la barra de filtros según la dirección del scroll.
 *
 * ─── El bug que corrige (parpadeo en móviles Chromium / Brave) ───
 *
 * La versión anterior alternaba `isCollapsed` comparando el scrollY de
 * dos frames consecutivos con un umbral de 5px. En Chromium eso entraba
 * en un bucle de realimentación:
 *
 *   colapsar → la barra reduce su altura ~200px → el scroll-anchoring
 *   de Chromium mueve window.scrollY → el hook lo lee como "subió" →
 *   expande → la altura vuelve a cambiar → otro salto de scrollY →
 *   colapsa de nuevo… y la barra parpadea sola con el usuario quieto.
 *
 * En Firefox no ocurre: Gecko no aplica scroll-anchoring de la misma
 * forma y throttlea distinto los eventos de scroll.
 *
 * ─── Las tres correcciones ───
 *
 * 1. HISTÉRESIS: ya no basta 1px entre frames. Hay que arrastrar un
 *    mínimo claro hacia abajo para ocultar y hacia arriba para mostrar,
 *    medido desde un "ancla", no entre frames consecutivos. El
 *    micro-jitter no llega al umbral.
 *
 * 2. CUARENTENA POST-CAMBIO: tras cada colapso/expansión se ignoran los
 *    eventos de scroll durante `settleMs` (cubre la transición de 300ms).
 *    En esa ventana solo se mueve el ancla, sin evaluar el estado. Así el
 *    reflow del propio colapso no se retroalimenta.
 *
 * 3. ANCLA DIRECCIONAL: mientras está colapsado, el ancla persigue el
 *    punto más bajo alcanzado; mientras está expandido, el más alto. Así
 *    "arrastrar X px hacia arriba" se mide desde donde empezó el gesto,
 *    no desde un punto arbitrario.
 */
export function useScrollCollapse(
  options?: UseScrollCollapseOptions
): boolean {
  const hideAfter = options?.hideAfter ?? 150;
  const collapseThreshold = options?.collapseThreshold ?? 32;
  const expandThreshold = options?.expandThreshold ?? 32;
  const settleMs = options?.settleMs ?? 400;

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Refs para el estado "real": el setState es asíncrono y el handler
  // de scroll necesita leer el valor vigente dentro del rAF.
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

      // ─── 1. Cuarentena: absorber el reflow del propio colapso ───
      if (now - lastChangeAtRef.current < settleMs) {
        anchorYRef.current = collapsedRef.current
          ? Math.max(anchorYRef.current, currentY)
          : Math.min(anchorYRef.current, currentY);
        return;
      }

      // ─── 2. Red de seguridad: cerca del top, siempre expandido ───
      if (collapsedRef.current && currentY <= hideAfter) {
        collapsedRef.current = false;
        lastChangeAtRef.current = now;
        anchorYRef.current = currentY;
        setIsCollapsed(false);
        return;
      }

      if (!collapsedRef.current) {
        // Expandido: el ancla persigue el punto más alto alcanzado.
        anchorYRef.current = Math.min(anchorYRef.current, currentY);

        // ─── 3. Ocultar: gesto claro hacia abajo ───
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
        // Colapsado: el ancla persigue el punto más bajo alcanzado.
        anchorYRef.current = Math.max(anchorYRef.current, currentY);

        // ─── 3. Mostrar: gesto claro hacia arriba ───
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