import { useCallback, useRef, useState } from 'react';

export interface MousePosition {
  x: number;
  y: number;
}

/**
 * Trackea la posición del mouse dentro de un elemento.
 * Devuelve un handler para onMouseMove y la posición actual.
 *
 * Usamos useRef para el último valor conocido y solo actualizamos
 * el estado cada ~16ms (requestAnimationFrame) para evitar
 * renders excesivos durante el movimiento rápido del mouse.
 */
export function useMousePosition() {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const latestEventRef = useRef<React.MouseEvent | null>(null);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    latestEventRef.current = event;

    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      if (latestEventRef.current) {
        setPosition({
          x: latestEventRef.current.clientX,
          y: latestEventRef.current.clientY,
        });
      }
      rafRef.current = null;
    });
  }, []);

  return { position, handleMouseMove };
}
