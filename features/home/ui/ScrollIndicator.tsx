'use client';

import { IconChevron } from '@/shared/ui/icons';

/**
 * Indicador de scroll ubicado debajo de la cinta VHS del hero.
 *
 * Invita al usuario a bajar a la segunda sección (las cintas
 * de películas). Al presionarlo, hace scroll suave hasta
 * #home-content.
 */
export default function ScrollIndicator() {
  const handleClick = () => {
    const content = document.getElementById('home-content');
    if (content) {
      content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex justify-center pt-6 md:pt-8 pb-10 md:pb-14">
      <button
        onClick={handleClick}
        aria-label="Desplazarse hacia abajo para ver más contenido"
        className="
          group flex flex-col items-center gap-1
          text-gray-500
          transition-colors duration-300
          hover:text-white
          cursor-pointer
        "
      >
        <span
          className="
            text-[10px] uppercase tracking-[0.25em]
            text-gray-600
            group-hover:text-gray-300
            transition-colors
          "
        >
          Ver más
        </span>
        <span className="animate-bounce">
          <IconChevron className="w-5 h-5" />
        </span>
      </button>
    </div>
  );
}