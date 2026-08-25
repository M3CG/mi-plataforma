import { IconCalendar } from '@/shared/ui/icons';
import { YEAR_MIN, YEAR_MAX } from '../config/options';
import DualRangeSlider from './DualRangeSlider';

interface YearRangeFilterProps {
  fromYear: number | null;
  toYear: number | null;
  onApply: (fromYear: number, toYear: number) => void;
  className?: string;
}

export default function YearRangeFilter({
  fromYear,
  toYear,
  onApply,
  className,
}: YearRangeFilterProps) {
  return (
    <DualRangeSlider
      icon={<IconCalendar className="w-3.5 h-3.5" />}
      min={YEAR_MIN}
      max={YEAR_MAX}
      step={1}
      initialFrom={fromYear ?? YEAR_MIN}
      initialTo={toYear ?? YEAR_MAX}
      onApply={onApply}
      fromLabel="Año mínimo"
      toLabel="Año máximo"
      className={className}
    />
  );
}
