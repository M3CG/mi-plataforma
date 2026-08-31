import { IconClock } from '@/shared/ui/icons';
import { RUNTIME_MIN, RUNTIME_MAX } from '../config/options';
import DualRangeSlider from './DualRangeSlider';

interface RuntimeRangeFilterProps {
  fromRuntime: number | null;
  toRuntime: number | null;
  onApply: (fromRuntime: number, toRuntime: number) => void;
  className?: string;
}

export default function RuntimeRangeFilter({
  fromRuntime,
  toRuntime,
  onApply,
  className,
}: RuntimeRangeFilterProps) {
  return (
    <DualRangeSlider
      icon={<IconClock className="w-3.5 h-3.5" />}
      min={RUNTIME_MIN}
      max={RUNTIME_MAX}
      step={5}
      initialFrom={fromRuntime ?? RUNTIME_MIN}
      initialTo={toRuntime ?? RUNTIME_MAX}
      onApply={onApply}
      fromLabel="Minimum runtime (minutes)"
      toLabel="Maximum runtime (minutes)"
      className={className}
    />
  );
}
