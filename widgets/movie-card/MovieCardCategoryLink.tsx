import Link from 'next/link';
import type { Category } from '@/entities/category';

interface MovieCardCategoryLinkProps {
  category: Category;
  href?: string;
}

export default function MovieCardCategoryLink({
  category,
  href,
}: MovieCardCategoryLinkProps) {
  const baseClasses = `
    relative z-20
    text-[10px] font-medium
    bg-white/5 border border-white/5
    text-gray-400
    px-2 py-0.5 rounded-full
    transition-all duration-150
  `;

  if (!href) {
    return <span className={baseClasses}>{category.name}</span>;
  }

  return (
    <Link
      href={href}
      title={`Filtrar películas por ${category.name}`}
      aria-label={`Filtrar películas por ${category.name}`}
      className={`
        ${baseClasses}
        hover:text-white hover:bg-white/10 hover:border-white/10
      `}
    >
      {category.name}
    </Link>
  );
}
