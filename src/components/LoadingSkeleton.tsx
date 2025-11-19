export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl animate-pulse">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 mx-auto mb-4" />
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2 mx-auto" />
      </div>

      {/* Card skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2 mx-auto mb-2" />
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3 mx-auto mb-6" />

        {/* Countdown cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl p-6 mb-3 h-24" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Message skeleton */}
        <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-full mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4 mx-auto" />
        </div>
      </div>
    </div>
  );
}
