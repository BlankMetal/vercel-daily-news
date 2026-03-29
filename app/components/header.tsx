import Link from "next/link";

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
          <button className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent/80">
            Subscribe
          </button>
        </div>
      </nav>
    </header>
  );
}
