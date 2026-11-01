export default function BlogsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-start justify-between gap-4 pt-7">
        <div className="space-y-2">
          <div className="h-9 w-36 rounded-md bg-card/60 border border-border animate-pulse" />
          <div className="h-4 w-72 rounded bg-card/60 border border-border animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 rounded-md bg-card/60 border border-border animate-pulse" />
          <div className="h-10 w-32 rounded-md bg-card/60 border border-border animate-pulse" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2.5">
        <div className="h-10 w-24 rounded-lg bg-card/60 border border-border animate-pulse" />
        <div className="h-10 w-24 rounded-lg bg-card/60 border border-border animate-pulse" />
        <div className="h-10 w-20 rounded-lg bg-card/60 border border-border animate-pulse" />
        <div className="h-10 w-24 rounded-lg bg-card/60 border border-border animate-pulse" />
        <div className="h-10 w-24 rounded-lg bg-card/60 border border-border animate-pulse" />
      </div>

      {/* Five Card skeletons */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-lg border border-border bg-card/60 p-4 min-h-[78px] animate-pulse"
          >
            <div className="size-11 rounded-lg bg-muted/20 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-6 w-12 rounded bg-muted/20" />
              <div className="h-3.5 w-24 rounded bg-muted/20" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="h-11 flex-1 min-w-[240px] max-w-[480px] rounded-md bg-card/60 border border-border animate-pulse" />
        <div className="h-11 w-36 rounded-md bg-card/60 border border-border animate-pulse" />
        <div className="h-11 w-32 rounded-md bg-card/60 border border-border animate-pulse" />
        <div className="h-11 w-24 rounded-md bg-card/60 border border-border animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border bg-card/40 overflow-hidden">
        <div className="border-b border-border bg-card/60 px-4 py-3.5">
          <div className="h-4 w-48 rounded bg-muted/20 animate-pulse" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 px-4 py-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="size-4 rounded bg-muted/20" />
                <div className="h-9 w-16 rounded bg-muted/20 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 rounded bg-muted/20" />
                  <div className="h-3 w-20 rounded bg-muted/20" />
                </div>
              </div>
              <div className="h-4 w-28 rounded bg-muted/20" />
              <div className="h-4 w-24 rounded bg-muted/20" />
              <div className="h-6 w-16 rounded-md bg-muted/20" />
              <div className="h-6 w-16 rounded-md bg-muted/20" />
              <div className="h-6 w-14 rounded-md bg-muted/20" />
              <div className="flex gap-1.5">
                <div className="size-8 rounded-md bg-muted/20" />
                <div className="size-8 rounded-md bg-muted/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

