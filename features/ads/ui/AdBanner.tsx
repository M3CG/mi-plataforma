// features/ads/ui/AdBanner.tsx
import { IconAd } from '@/shared/ui/icons';
import { ADS_ENABLED } from '../config/ads';

interface AdBannerProps {
  format?: 'horizontal' | 'square' | 'skyscraper';
}

export default function AdBanner({
  format = 'horizontal',
}: AdBannerProps) {
  // Sin anuncios contratados: no renderizar el placeholder.
  if (!ADS_ENABLED) {
    return null;
  }

  if (format === 'skyscraper') {
    return (
      <div className="w-full h-full bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 p-6">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <IconAd />
        </div>
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Ad<br />Space
        </p>
        <p className="text-[10px] text-gray-600 font-mono">
          160 × 600
        </p>
      </div>
    );
  }

  const heightClass = format === 'horizontal' ? 'h-24' : 'h-64';

  return (
    <div
      className={`w-full ${heightClass} bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center gap-4 my-4`}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <IconAd className="w-4 h-4 text-gray-500" />
        </div>
        <p className="text-xs text-gray-500">
          Ad Space
        </p>
      </div>
    </div>
  );
}
