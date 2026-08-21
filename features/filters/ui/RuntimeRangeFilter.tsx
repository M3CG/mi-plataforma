'use client';
import { useState } from 'react';
import { IconClock } from '@/shared/ui/icons';
import { RUNTIME_MIN, RUNTIME_MAX } from '../config/options';
import styles from './year-range.module.css';

interface RuntimeRangeFilterProps {
  fromRuntime: number | null;
  toRuntime: number | null;
  onApply: (fromRuntime: number, toRuntime: number) => void;
}

export default function RuntimeRangeFilter({
  fromRuntime,
  toRuntime,
  onApply,
}: RuntimeRangeFilterProps) {
  const [minRuntime, setMinRuntime] = useState(fromRuntime ?? RUNTIME_MIN);
  const [maxRuntime, setMaxRuntime] = useState(toRuntime ?? RUNTIME_MAX);

  const [prevFromRuntime, setPrevFromRuntime] = useState(fromRuntime);
  const [prevToRuntime, setPrevToRuntime] = useState(toRuntime);

  if (prevFromRuntime !== fromRuntime) {
    setPrevFromRuntime(fromRuntime);
    setMinRuntime(fromRuntime ?? RUNTIME_MIN);
  }
  if (prevToRuntime !== toRuntime) {
    setPrevToRuntime(toRuntime);
    setMaxRuntime(toRuntime ?? RUNTIME_MAX);
  }

  const apply = () => {
    onApply(minRuntime, maxRuntime);
  };

  const range = RUNTIME_MAX - RUNTIME_MIN;
  const left = ((minRuntime - RUNTIME_MIN) / range) * 100;
  const right = 100 - ((maxRuntime - RUNTIME_MIN) / range) * 100;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
      <span className="text-gray-500 flex-shrink-0">
        <IconClock className="w-3.5 h-3.5" />
      </span>
      <span className="text-xs font-medium text-gray-300 w-8 text-right tabular-nums flex-shrink-0">
        {minRuntime}
      </span>
      <div className={`${styles.rangeSlider} w-32 lg:w-44 xl:w-56 relative flex-shrink-0`}>
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
          min={RUNTIME_MIN}
          max={RUNTIME_MAX}
          step={5}
          value={minRuntime}
          onChange={(event) =>
            setMinRuntime(Math.min(Number(event.target.value), maxRuntime - 5))
          }
          onMouseUp={apply}
          onTouchEnd={apply}
          onKeyUp={apply}
          onBlur={apply}
          aria-label="Duración mínima (minutos)"
          className={styles.rangeInput}
        />
        <input
          type="range"
          min={RUNTIME_MIN}
          max={RUNTIME_MAX}
          step={5}
          value={maxRuntime}
          onChange={(event) =>
            setMaxRuntime(Math.max(Number(event.target.value), minRuntime + 5))
          }
          onMouseUp={apply}
          onTouchEnd={apply}
          onKeyUp={apply}
          onBlur={apply}
          aria-label="Duración máxima (minutos)"
          className={styles.rangeInput}
        />
      </div>
      <span className="text-xs font-medium text-gray-300 w-8 tabular-nums flex-shrink-0">
        {maxRuntime}
      </span>
    </div>
  );
}
