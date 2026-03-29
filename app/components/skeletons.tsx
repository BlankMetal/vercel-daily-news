export function BreakingNewsSkeleton() {
  return (
    <div className="bg-accent/10 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="h-5 w-20 animate-pulse rounded bg-border" />
        <div className="h-4 w-64 animate-pulse rounded bg-border" />
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="aspect-[16/9] animate-pulse bg-border" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-border" />
        <div className="h-5 w-full animate-pulse rounded bg-border" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
        <div className="h-3 w-24 animate-pulse rounded bg-border" />
      </div>
    </div>
  );
}

export function ArticleGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}
