export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="h-10 w-64 mx-auto rounded-lg bg-muted animate-shimmer" />
        <div className="h-4 w-48 mx-auto rounded bg-muted animate-shimmer" />
        <div className="h-3 w-20 mx-auto rounded bg-muted animate-shimmer" />
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted animate-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 rounded bg-muted animate-shimmer" />
            <div className="h-3 w-32 rounded bg-muted animate-shimmer" />
          </div>
        </div>
        <div className="h-6 w-24 rounded bg-muted animate-shimmer" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="h-3 w-8 mx-auto rounded bg-muted animate-shimmer" />
              <div className="h-4 w-12 mx-auto rounded bg-muted animate-shimmer" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="h-3 w-16 rounded bg-muted animate-shimmer" />
        <div className="h-2 rounded-full bg-muted animate-shimmer" />
        <div className="flex justify-between">
          <div className="h-3 w-20 rounded bg-muted animate-shimmer" />
          <div className="h-3 w-16 rounded bg-muted animate-shimmer" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted animate-shimmer" />
          <div className="h-3 w-24 rounded bg-muted animate-shimmer" />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
