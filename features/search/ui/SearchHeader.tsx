// features/search/ui/SearchHeader.tsx

interface SearchHeaderProps {
  query: string;
  count: number;
}

export default function SearchHeader({
  query,
  count,
}: SearchHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-white">
        Buscaste: <span className="text-red-500">"{query}"</span>
      </h2>

      <p className="text-sm text-gray-400 mt-1">
        {count === 0
          ? 'Sin coincidencias en el catálogo'
          : `${count} ${count === 1 ? 'resultado' : 'resultados'}`}
      </p>
    </div>
  );
}