// features/movies-page/ui/FilterMenuSkeleton.tsx

export default function FilterMenuSkeleton() {
  return (
    <div className="bg-gray-950/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 mb-4 animate-pulse">
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-10 w-32 bg-white/5 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}