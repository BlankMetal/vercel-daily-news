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

export function ArticleGridSkeleton({ count = 6 }: { count?: number } = {}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ArticlePageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="h-4 w-20 animate-pulse rounded bg-border" />
      <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-border" />
      <div className="mt-6 flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-border" />
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-border" />
          <div className="h-3 w-24 animate-pulse rounded bg-border" />
        </div>
      </div>
      <div className="mt-8 aspect-[16/9] animate-pulse rounded-lg bg-border" />
      <div className="mt-8 space-y-4">
        <div className="h-4 w-full animate-pulse rounded bg-border" />
        <div className="h-4 w-full animate-pulse rounded bg-border" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-border" />
        <div className="h-4 w-full animate-pulse rounded bg-border" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-border" />
      </div>
    </div>
  );
}

export function SearchResultsSkeleton({ count = 12 }: { count?: number } = {}) {
  return (
    <div>
      <div className="mb-6 h-7 w-40 animate-pulse rounded bg-border" />
      <ArticleGridSkeleton count={count} />
    </div>
  );
}

export function TrendingArticlesSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 h-8 w-48 animate-pulse rounded bg-border" />
      <ArticleGridSkeleton count={3} />
    </div>
  );
}
