import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkLabel?: string;
}

/**
 * Header de sección minimalista:
 * versalitas con tracking amplio + hairline + link sutil.
 */
export default function SectionHeader({
  title,
  href,
  linkLabel = 'Ver todo',
}: SectionHeaderProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-6 border-b border-white/5 pb-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-xs text-gray-600 hover:text-white transition-colors"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
