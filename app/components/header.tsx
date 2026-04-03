import { Suspense } from "react";
import Link from "next/link";
import { SubscriptionIndicator } from "./subscription-indicator";

function SubscribeButtonSkeleton() {
  return (
    <div className="h-8 w-24 animate-pulse rounded-full bg-border" />
  );
}

export function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Vercel Daily
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/search"
            className="text-sm font-medium text-muted hover:text-white"
          >
            Search
          </Link>
          <Suspense fallback={<SubscribeButtonSkeleton />}>
            <SubscriptionIndicator />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}
