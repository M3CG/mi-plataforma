import type { ReactNode } from 'react';

export type PosterGridVariant = 'compact' | 'spacious';

interface PosterGridProps {
  children: ReactNode;
  variant?: PosterGridVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<PosterGridVariant, string> = {
  compact:
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5',
  spacious:
    'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6',
};

export default function PosterGrid({
  children,
  variant = 'compact',
  className,
}: PosterGridProps) {
  const classes = [VARIANT_CLASSES[variant], className]
    .filter(Boolean)
    .join(' ');
  return <div className={classes}>{children}</div>;
}