#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f package.json ]]; then
  echo "❌ Ejecuta esto desde la raíz del frontend (Next.js)." >&2
  exit 1
fi

echo "🚀 Optimizando espacio de filtros de rango..."

# ─────────────────────────────────────────────────────────────
# 1. YearRangeFilter más compacto
# ─────────────────────────────────────────────────────────────
cat > features/filters/ui/YearRangeFilter.tsx <<'EOF_YEAR_FILTER'
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
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
      <span className="text-gray-500 flex-shrink-0">
        <IconCalendar className="w-3.5 h-3.5" />
      </span>
      <span className="text-xs font-medium text-gray-300 w-8 text-right tabular-nums flex-shrink-0">
        {minYear}
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
      <span className="text-xs font-medium text-gray-300 w-8 tabular-nums flex-shrink-0">
        {maxYear}
      </span>
    </div>
  );
}
EOF_YEAR_FILTER

# ─────────────────────────────────────────────────────────────
# 2. RuntimeRangeFilter más compacto
# ─────────────────────────────────────────────────────────────
cat > features/filters/ui/RuntimeRangeFilter.tsx <<'EOF_RUNTIME_FILTER'
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
EOF_RUNTIME_FILTER

# ─────────────────────────────────────────────────────────────
# 3. Ajustar FilterMenu para mejor distribución
# ─────────────────────────────────────────────────────────────
cat > features/filters/ui/FilterMenu.tsx <<'EOF_FILTER_MENU'
// features/filters/ui/FilterMenu.tsx
'use client';
import type { Category } from '@/entities/category';
import { useMovieFilters } from '../model/useMovieFilters';
import { useScrollCollapse } from '../model/useScrollCollapse';
import { useStickySentinel } from '../model/useStickySentinel';
import GenreFilter from './GenreFilter';
import RatingFilter from './RatingFilter';
import CountryFilter from './CountryFilter';
import YearRangeFilter from './YearRangeFilter';
import RuntimeRangeFilter from './RuntimeRangeFilter';
import SortFilter from './SortFilter';
import ActiveFiltersBar from './ActiveFiltersBar';

export interface FilterMenuProps {
  categories: Category[];
  countries: string[];
}

export default function FilterMenu({
  categories,
  countries,
}: FilterMenuProps) {
  const {
    activeGenres,
    minRating,
    country,
    sort,
    fromYear,
    toYear,
    hasYearFilter,
    fromRuntime,
    toRuntime,
    hasRuntimeFilter,
    filterCount,
    toggleGenre,
    removeGenre,
    setRating,
    removeRating,
    setCountry,
    removeCountry,
    setSort,
    applyYearRange,
    removeYear,
    applyRuntimeRange,
    removeRuntime,
    clearFilters,
  } = useMovieFilters();

  const { ref: sentinelRef, isStuck } = useStickySentinel<HTMLDivElement>();
  const isCollapsed = useScrollCollapse();

  return (
    <>
      {/* Sentinel para detectar cuándo el menú está "pegado" al header */}
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />

      <div className="sticky top-16 z-30 -mx-4 md:-mx-8 px-4 md:px-8 pb-4">
        <div
          className={`bg-gray-950/80 backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/20 transition-all duration-300 ${
            isStuck
              ? 'rounded-b-2xl rounded-t-none border-t-0'
              : 'rounded-2xl'
          }`}
        >
          {/* ═══ SECCIÓN COLAPSABLE: CONTROLES DE FILTRO ═══ */}
          <div
            className="transition-all duration-300 ease-in-out"
            style={{
              maxHeight: isCollapsed ? '0px' : '400px',
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'translateY(-8px)' : 'translateY(0)',
              pointerEvents: isCollapsed ? 'none' : 'auto',
            }}
          >
            <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-3">
              <GenreFilter
                categories={categories}
                activeGenres={activeGenres}
                onToggleGenre={toggleGenre}
              />
              <RatingFilter value={minRating} onChange={setRating} />
              <CountryFilter
                countries={countries}
                value={country}
                onChange={setCountry}
              />
              <YearRangeFilter
                fromYear={fromYear}
                toYear={toYear}
                onApply={applyYearRange}
              />
              <RuntimeRangeFilter
                fromRuntime={fromRuntime}
                toRuntime={toRuntime}
                onApply={applyRuntimeRange}
              />
              {/* Spacer flexible que empuja SortFilter a la derecha */}
              <div className="flex-1 min-w-4" />
              <SortFilter value={sort} onChange={setSort} />
            </div>
          </div>

          {/* ═══ SECCIÓN SIEMPRE VISIBLE: FILTROS ACTIVOS ═══ */}
          <ActiveFiltersBar
            categories={categories}
            activeGenres={activeGenres}
            minRating={minRating}
            country={country}
            fromYear={fromYear}
            toYear={toYear}
            hasYearFilter={hasYearFilter}
            fromRuntime={fromRuntime}
            toRuntime={toRuntime}
            hasRuntimeFilter={hasRuntimeFilter}
            filterCount={filterCount}
            onRemoveGenre={removeGenre}
            onRemoveRating={removeRating}
            onRemoveCountry={removeCountry}
            onRemoveYear={removeYear}
            onRemoveRuntime={removeRuntime}
            onClearAll={clearFilters}
          />
        </div>
      </div>
    </>
  );
}
EOF_FILTER_MENU

echo ""
echo "✅ Filtros optimizados para ocupar menos espacio."
echo ""
echo "Cambios aplicados:"
echo "  - Sliders más compactos en pantallas medianas"
echo "  - Valores numéricos más estrechos"
echo "  - Padding reducido en contenedores"
echo "  - Mejor distribución con flex-wrap"
echo ""
echo "Ahora ejecuta: npm run dev"