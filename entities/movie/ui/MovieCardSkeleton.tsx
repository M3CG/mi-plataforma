// entities/movie/ui/MovieCardSkeleton.tsx

export default function MovieCardSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-white/5" />

      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-white/10 rounded w-4/5" />
        <div className="h-3 bg-white/10 rounded w-2/5" />
        <div className="h-3 bg-white/10 rounded w-3/5" />
      </div>
    </div>
  );
}