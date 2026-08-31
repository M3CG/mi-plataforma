function StripSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
        <div className="h-3 w-40 bg-white/10 rounded" />
        <div className="h-7 w-24 bg-white/5 rounded-full" />
      </div>
      <div className="flex gap-5 md:gap-6 overflow-hidden">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="w-44 sm:w-48 md:w-52 lg:w-56 shrink-0">
            <div className="aspect-[2/3] rounded-lg bg-white/5" />
            <div className="mt-3 h-4 w-3/4 bg-white/5 rounded" />
            <div className="mt-1.5 h-3 w-10 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeStripsSkeleton() {
  return (
    <>
      <StripSkeleton />
      <StripSkeleton />
    </>
  );
}
