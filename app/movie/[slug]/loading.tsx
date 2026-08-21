// app/movie/[slug]/loading.tsx

export default function MovieDetailLoading() {
  return (
    <main className="min-h-screen">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 animate-pulse" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-12">
          {/* Back button skeleton */}
          <div className="h-10 w-24 bg-white/5 rounded-full animate-pulse" />

          <div className="flex flex-col md:flex-row gap-8 mt-8">
            {/* Poster skeleton */}
            <div className="w-40 md:w-48 flex-shrink-0 mx-auto md:mx-0">
              <div className="relative aspect-[2/3] rounded-2xl bg-white/5 animate-pulse" />
            </div>

            {/* Info skeleton */}
            <div className="flex-1 space-y-4">
              <div className="h-10 w-3/4 bg-white/10 rounded-lg animate-pulse" />
              <div className="flex gap-3">
                <div className="h-8 w-16 bg-white/5 rounded-full animate-pulse" />
                <div className="h-8 w-16 bg-white/5 rounded-full animate-pulse" />
                <div className="h-8 w-20 bg-white/5 rounded-full animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-7 w-20 bg-white/5 rounded-full animate-pulse" />
                <div className="h-7 w-16 bg-white/5 rounded-full animate-pulse" />
                <div className="h-7 w-24 bg-white/5 rounded-full animate-pulse" />
              </div>
              <div className="flex gap-3 mt-6">
                <div className="h-12 w-36 bg-red-600/20 rounded-full animate-pulse" />
                <div className="h-12 w-32 bg-white/5 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          <div className="lg:col-span-2 space-y-3">
            <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="space-y-5">
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-40 bg-white/5 rounded animate-pulse" />
          </div>
        </div>

        {/* Cast skeleton */}
        <div className="mb-12">
          <div className="h-6 w-40 bg-white/10 rounded animate-pulse mb-4" />
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 text-center">
                <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse mx-auto mb-2" />
                <div className="h-3 w-16 bg-white/5 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Player skeleton */}
        <div className="pt-10 border-t border-white/5">
          <div className="h-6 w-32 bg-white/10 rounded animate-pulse mb-4" />
          <div className="aspect-video bg-white/[0.02] rounded-2xl animate-pulse" />
        </div>
      </div>
    </main>
  );
}
