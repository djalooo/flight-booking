export function FlightSkeleton() {
  return (
    <div className="rounded-xl bg-white p-4 sm:p-5" aria-hidden>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 sm:w-[190px] sm:shrink-0">
          <div className="skeleton-bar h-10 w-14 shrink-0 rounded-full" />
          <div className="flex-1">
            <div className="skeleton-bar h-3.5 w-3/4 rounded-full" />
            <div className="skeleton-bar mt-2 h-3 w-1/2 rounded-full" />
          </div>
        </div>
        <div className="flex flex-1 items-center gap-3">
          <div className="skeleton-bar h-8 w-[86px] shrink-0 rounded-lg" />
          <div className="skeleton-bar h-3 flex-1 rounded-full" />
          <div className="skeleton-bar h-8 w-[86px] shrink-0 rounded-lg" />
        </div>
        <div className="flex items-center justify-between sm:w-[130px] sm:flex-col sm:items-end sm:gap-2">
          <div className="skeleton-bar h-5 w-20 rounded-full" />
          <div className="skeleton-bar h-4 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <FlightSkeleton key={i} />
      ))}
    </div>
  );
}
