import Link from 'next/link';
import type { Category } from '@/entities/category';

interface MovieCardCategoryLinkProps {
  category: Category;
  href?: string;
  highlighted?: boolean;
}

export default function MovieCardCategoryLink({
  category,
  href,
  highlighted = false,
}: MovieCardCategoryLinkProps) {
  const baseClasses = `
    relative z-20
    text-[10px] font-medium
    px-2 py-0.5 rounded-full
    transition-all duration-150
  `;

  const stateClasses = highlighted
    ? `
      bg-red-600/20 border border-red-500/40
      text-red-200
      hover:bg-red-600/30 hover:border-red-500/60 hover:text-white
    `
    : `
      bg-white/5 border border-white/5
      text-gray-400
      hover:text-white hover:bg-white/10 hover:border-white/10
    `;

  if (!href) {
    return (
      <span className={`${baseClasses} ${stateClasses}`}>
        {category.name}
      </span>
    );
  }

  return (
    <Link
      href={href}
      title={
        highlighted
          ? `Coincide con tu filtro: ${category.name}`
          : `Filtrar películas por ${category.name}`
      }
      aria-label={
        highlighted
          ? `Coincide con tu filtro: ${category.name}`
          : `Filtrar películas por ${category.name}`
      }
      className={`${baseClasses} ${stateClasses}`}
    >
      {category.name}
    </Link>
  );
}
