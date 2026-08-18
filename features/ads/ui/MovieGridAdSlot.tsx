// features/ads/ui/MovieGridAdSlot.tsx
import AdBanner from './AdBanner';
import { shouldShowAdAtIndex } from '../lib/adPlacement';

interface MovieGridAdSlotProps {
  index: number;
}

export default function MovieGridAdSlot({ index }: MovieGridAdSlotProps) {
  if (!shouldShowAdAtIndex(index)) {
    return null;
  }

  return (
    <div className="col-span-full my-2">
      <AdBanner format="horizontal" />
    </div>
  );
}