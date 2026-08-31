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
        You searched for: <span className="text-red-500">&quot;{query}&quot;</span>
      </h2>
      <p className="text-sm text-gray-400 mt-1">
        {count === 0
          ? 'No matches in the catalog'
          : `${count} ${count === 1 ? 'result' : 'results'}`}
      </p>
    </div>
  );
}
