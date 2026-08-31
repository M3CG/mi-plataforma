import Link from 'next/link';
import { IconBack } from '@/shared/ui/icons';

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkLabel?: string;
}

/**
 * Header de sección: versalitas con tracking amplio + hairline
 * + botón "Ver todo" con estilo pill.
 */
export default function SectionHeader({
  title,
  href,
  linkLabel = 'View all',
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 border-b border-white/5 pb-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-400">
        {title}
      </h2>

      {href && (
        <Link
          href={href}
          className="
            group inline-flex items-center gap-2
            rounded-full
            border border-white/10 bg-white/[0.02]
            px-3.5 py-1.5
            text-[11px] font-medium uppercase tracking-[0.15em]
            text-gray-400
            transition-all duration-300
            hover:border-red-500/40 hover:bg-red-600/5 hover:text-red-300
          "
        >
          <span>{linkLabel}</span>
          <span
            className="
              flex items-center
              transition-transform duration-300
              group-hover:translate-x-0.5
            "
          >
            <IconBack className="w-3 h-3 rotate-180" />
          </span>
        </Link>
      )}
    </div>
  );
}