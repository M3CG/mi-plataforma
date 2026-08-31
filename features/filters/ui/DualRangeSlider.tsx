'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import styles from './range.module.css';

interface DualRangeSliderProps {
  /** Icono a la izquierda del slider (ej: IconCalendar, IconClock). */
  icon: ReactNode;
  /** Valor mínimo permitido. */
  min: number;
  /** Valor máximo permitido. */
  max: number;
  /** Incremento entre valores (1 para años, 5 para minutos). */
  step: number;
  /** Valor actual del extremo inferior (desde afuera). */
  initialFrom: number;
  /** Valor actual del extremo superior (desde afuera). */
  initialTo: number;
  /** Callback que se dispara al soltar el slider o al perder foco. */
  onApply: (from: number, to: number) => void;
  /** Label accesible para el input inferior. */
  fromLabel: string;
  /** Label accesible para el input superior. */
  toLabel: string;
  /** Clases CSS adicionales para el contenedor. */
  className?: string;
}

/**
 * Slider de rango dual genérico.
 *
 * Responsabilidades:
 * - Mantener estado interno [from, to] sincronizado con props externas.
 * - Aplicar cambios solo al soltar el slider (onMouseUp/onTouchEnd/onKeyUp/onBlur)
 *   para evitar re-renders excesivos en el grid mientras el usuario arrastra.
 * - Calcular el ancho del track activo en porcentajes.
 *
 * No se preocupa por:
 * - El significado de los valores (años vs minutos).
 * - Cuándo resetear los filtros (eso lo maneja el padre).
 */
export default function DualRangeSlider({
  icon,
  min,
  max,
  step,
  initialFrom,
  initialTo,
  onApply,
  fromLabel,
  toLabel,
  className,
}: DualRangeSliderProps) {
  const [fromValue, setFromValue] = useState(initialFrom);
  const [toValue, setToValue] = useState(initialTo);
  const [prevInitialFrom, setPrevInitialFrom] = useState(initialFrom);
  const [prevInitialTo, setPrevInitialTo] = useState(initialTo);

  // Sincronización prop → state cuando el padre cambia los valores externos
  // (por ejemplo, al limpiar el filtro). Patrón recomendado por React 19
  // para ajustar estado durante el render.
  if (prevInitialFrom !== initialFrom) {
    setPrevInitialFrom(initialFrom);
    setFromValue(initialFrom);
  }
  if (prevInitialTo !== initialTo) {
    setPrevInitialTo(initialTo);
    setToValue(initialTo);
  }

  const apply = () => {
    onApply(fromValue, toValue);
  };

  const range = max - min;
  const left = range > 0 ? ((fromValue - min) / range) * 100 : 0;
  const right = range > 0 ? 100 - ((toValue - min) / range) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 ${className ?? ''}`}
    >
      <span className="text-gray-500 flex-shrink-0">{icon}</span>

      <span className="text-xs font-medium text-gray-300 w-8 text-right tabular-nums flex-shrink-0">
        {fromValue}
      </span>

      <div
        className={`${styles.rangeSlider} flex-1 min-w-0 lg:flex-none lg:w-44 xl:w-56 relative`}
      >
        <div className={styles.track} />
        <div
          className={styles.trackActive}
          style={{ left: `${left}%`, right: `${right}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={fromValue}
          onChange={(event) =>
            setFromValue(Math.min(Number(event.target.value), toValue - step))
          }
          onMouseUp={apply}
          onTouchEnd={apply}
          onKeyUp={apply}
          onBlur={apply}
          aria-label={fromLabel}
          className={styles.rangeInput}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={toValue}
          onChange={(event) =>
            setToValue(Math.max(Number(event.target.value), fromValue + step))
          }
          onMouseUp={apply}
          onTouchEnd={apply}
          onKeyUp={apply}
          onBlur={apply}
          aria-label={toLabel}
          className={styles.rangeInput}
        />
      </div>

      <span className="text-xs font-medium text-gray-300 w-8 tabular-nums flex-shrink-0">
        {toValue}
      </span>
    </div>
  );
}
