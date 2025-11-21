export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl">
      {/* Header skeleton */}
      <div className="text-center mb-8 space-y-4">
        <div className="relative h-12 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded-xl w-3/4 mx-auto overflow-hidden">
          <div className="absolute inset-0 animate-shimmer-skeleton" />
        </div>
        <div className="relative h-7 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded-lg w-1/2 mx-auto overflow-hidden">
          <div className="absolute inset-0 animate-shimmer-skeleton" />
        </div>
        <div className="relative h-9 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded-lg w-24 mx-auto overflow-hidden">
          <div className="absolute inset-0 animate-shimmer-skeleton" />
        </div>
      </div>

      {/* Progress Bar skeleton */}
      <div className="mb-6">
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <div className="relative h-4 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded w-32 overflow-hidden">
              <div className="absolute inset-0 animate-shimmer-skeleton" />
            </div>
            <div className="relative h-4 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded w-12 overflow-hidden">
              <div className="absolute inset-0 animate-shimmer-skeleton" />
            </div>
          </div>
          <div className="relative h-3 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded-full overflow-hidden">
            <div className="absolute inset-0 animate-shimmer-skeleton" />
          </div>
        </div>
      </div>

      {/* Card skeleton */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
        <div className="relative h-8 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded-lg w-1/2 mx-auto mb-2 overflow-hidden">
          <div className="absolute inset-0 animate-shimmer-skeleton" />
        </div>
        <div className="relative h-5 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded-lg w-2/3 mx-auto mb-6 overflow-hidden">
          <div className="absolute inset-0 animate-shimmer-skeleton" />
        </div>

        {/* Countdown cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="relative bg-gradient-to-br from-slate-200/60 via-slate-300/90 to-slate-200/60 dark:from-slate-700/60 dark:via-slate-600/90 dark:to-slate-700/60 rounded-2xl p-6 h-28 overflow-hidden shadow-md">
                <div className="absolute inset-0 animate-shimmer-skeleton" />
              </div>
              <div className="relative h-7 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded-full w-20 mx-auto overflow-hidden">
                <div className="absolute inset-0 animate-shimmer-skeleton" />
              </div>
            </div>
          ))}
        </div>

        {/* Message skeleton */}
        <div className="bg-gradient-to-r from-slate-100/80 via-slate-50/80 to-slate-100/80 dark:from-slate-700/80 dark:via-slate-600/80 dark:to-slate-700/80 rounded-xl p-6 overflow-hidden relative">
          <div className="space-y-3">
            <div className="relative h-4 bg-gradient-to-r from-slate-200/60 via-slate-300/90 to-slate-200/60 dark:from-slate-600/60 dark:via-slate-500/90 dark:to-slate-600/60 rounded-full w-full overflow-hidden">
              <div className="absolute inset-0 animate-shimmer-skeleton" />
            </div>
            <div className="relative h-4 bg-gradient-to-r from-slate-200/60 via-slate-300/90 to-slate-200/60 dark:from-slate-600/60 dark:via-slate-500/90 dark:to-slate-600/60 rounded-full w-5/6 mx-auto overflow-hidden">
              <div className="absolute inset-0 animate-shimmer-skeleton" />
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Times skeleton */}
      <div className="mt-6">
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 shadow-md">
          <div className="relative h-6 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded w-32 mx-auto mb-4 overflow-hidden">
            <div className="absolute inset-0 animate-shimmer-skeleton" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="relative h-16 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded-lg overflow-hidden"
              >
                <div className="absolute inset-0 animate-shimmer-skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
