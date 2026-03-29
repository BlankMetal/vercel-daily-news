import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-zinc-50 to-white px-4 py-20 dark:from-zinc-900 dark:to-zinc-950 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mb-4 inline-block rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white dark:bg-zinc-100 dark:text-zinc-900">
          Your Daily Dose of Dev
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
          The Latest in Web Development
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          News, tutorials, and insights from the Vercel ecosystem. Stay up to
          date with the tools and techniques shaping the modern web.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="#featured"
            className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Browse Articles
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Search
          </Link>
        </div>
      </div>
    </section>
  );
}
