// app/actor/[slug]/loading.tsx

export default function ActorDetailLoading() {
  return (
    <main className="min-h-screen">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-gray-950" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-12">
          {/* Back button skeleton */}
          <div className="h-10 w-24 bg-white/5 rounded-full animate-pulse" />

          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mt-8">
            {/* Photo skeleton */}
            <div className="w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white/5 animate-pulse" />
            </div>

            {/* Info skeleton */}
            <div className="text-center md:text-left flex-1 space-y-3">
              <div className="h-3 w-16 bg-white/10 rounded mx-auto md:mx-0 animate-pulse" />
              <div className="h-10 w-48 bg-white/10 rounded-lg mx-auto md:mx-0 animate-pulse" />
              <div className="h-4 w-64 bg-white/5 rounded mx-auto md:mx-0 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Filmography skeleton */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="h-6 w-32 bg-white/10 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-white/5" />
              <div className="p-3.5 space-y-2">
                <div className="h-4 bg-white/10 rounded w-4/5" />
                <div className="h-3 bg-white/10 rounded w-2/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
