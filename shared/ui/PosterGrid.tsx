import type { ReactNode } from 'react';

export type PosterGridVariant = 'compact' | 'spacious';

interface PosterGridProps {
  children: ReactNode;
  variant?: PosterGridVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<PosterGridVariant, string> = {
  compact:
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4',
  spacious:
    'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6',
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
