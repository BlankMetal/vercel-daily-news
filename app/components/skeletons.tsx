export function BreakingNewsSkeleton() {
  return (
    <div className="bg-zinc-900 px-4 py-3 dark:bg-zinc-100">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="h-5 w-20 animate-pulse rounded bg-zinc-700 dark:bg-zinc-300" />
        <div className="h-4 w-64 animate-pulse rounded bg-zinc-700 dark:bg-zinc-300" />
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="aspect-[16/9] animate-pulse bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-5 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
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
