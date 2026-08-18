// features/ads/index.ts

export { default as AdBanner } from './ui/AdBanner';
export { default as MovieGridWithAds } from './ui/MovieGridWithAds';
export { default as MovieGridAdSlot } from './ui/MovieGridAdSlot';

export { shouldShowAdAtIndex } from './lib/adPlacement';

export { MOVIES_PER_AD } from './config/ads';