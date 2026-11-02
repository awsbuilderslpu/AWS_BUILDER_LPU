export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Sidebar Skeleton */}
        <div className="w-full lg:w-[240px] shrink-0">
          <div className="rounded-xl border border-border bg-card/40 p-3 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 w-full rounded-lg bg-card/60" />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          {/* Header Card Skeleton */}
          <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
            <div className="h-[160px] sm:h-[200px] w-full bg-card/60" />
            <div className="px-6 pb-6 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="size-28 rounded-full border-4 border-background bg-card/80 shrink-0" />
                  <div className="space-y-2 mb-1">
                    <div className="h-7 w-48 rounded bg-card/80" />
                    <div className="h-4 w-28 rounded bg-card/60" />
                  </div>
                </div>
                <div className="h-9 w-28 rounded-lg bg-card/60" />
              </div>
            </div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card/40 p-6 sm:p-8 space-y-4"
              >
                <div className="h-5 w-36 rounded bg-card/60 border-b border-border pb-3" />
                <div className="space-y-3 pt-2">
                  <div className="h-10 w-full rounded bg-card/60" />
                  <div className="h-10 w-full rounded bg-card/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

