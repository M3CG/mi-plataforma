'use client';

import { useState } from 'react';
import { IconCalendar } from '@/shared/ui/icons';
import { YEAR_MIN, YEAR_MAX } from '../config/options';
import styles from './year-range.module.css';

interface YearRangeFilterProps {
  fromYear: number | null;
  toYear: number | null;
  onApply: (fromYear: number, toYear: number) => void;
}

export default function YearRangeFilter({
  fromYear,
  toYear,
  onApply,
}: YearRangeFilterProps) {
  const [minYear, setMinYear] = useState(fromYear ?? YEAR_MIN);
  const [maxYear, setMaxYear] = useState(toYear ?? YEAR_MAX);

  // ─── Patrón React 19: ajustar estado durante render ───
  // Usamos variables de estado (no refs) para trackear los valores
  // previos de las props. Esto permite sincronizar el estado local
  // con props cambiantes sin usar useEffect ni acceder a refs en render.
  //
  // React agrupa los setStates llamados durante el render con el render
  // actual, por lo que no causa renders adicionales.
  const [prevFromYear, setPrevFromYear] = useState(fromYear);
  const [prevToYear, setPrevToYear] = useState(toYear);

  if (prevFromYear !== fromYear) {
    setPrevFromYear(fromYear);
    setMinYear(fromYear ?? YEAR_MIN);
  }
  if (prevToYear !== toYear) {
    setPrevToYear(toYear);
    setMaxYear(toYear ?? YEAR_MAX);
  }

  const apply = () => {
    onApply(minYear, maxYear);
  };

  const range = YEAR_MAX - YEAR_MIN;
  const left = ((minYear - YEAR_MIN) / range) * 100;
  const right = 100 - ((maxYear - YEAR_MIN) / range) * 100;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
      <span className="text-gray-500">
        <IconCalendar />
      </span>

      <span className="text-sm font-medium text-gray-300 w-10 text-right tabular-nums">
        {minYear}
      </span>

      <div className={`${styles.rangeSlider} w-56 sm:w-80 relative`}>
        <div className={styles.track} />
        <div
          className={styles.trackActive}
          style={{
            left: `${left}%`,
            right: `${right}%`,
          }}
        />

        <input
          type="range"
          min={String(YEAR_MIN)}
          max={YEAR_MAX}
          value={minYear}
          onChange={(event) =>
            setMinYear(Math.min(Number(event.target.value), maxYear - 1))
          }
          onMouseUp={apply}
          onTouchEnd={apply}
          onKeyUp={apply}
          onBlur={apply}
          aria-label="Año mínimo"
          className={styles.rangeInput}
        />

        <input
          type="range"
          min={String(YEAR_MIN)}
          max={YEAR_MAX}
          value={maxYear}
          onChange={(event) =>
            setMaxYear(Math.max(Number(event.target.value), minYear + 1))
          }
          onMouseUp={apply}
          onTouchEnd={apply}
          onKeyUp={apply}
          onBlur={apply}
          aria-label="Año máximo"
          className={styles.rangeInput}
        />
      </div>

      <span className="text-sm font-medium text-gray-300 w-10 tabular-nums">
        {maxYear}
      </span>
    </div>
  );
}
