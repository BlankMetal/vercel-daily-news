import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-surface px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mb-4 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          Your Daily Dose of Dev
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          The Latest in Web Development
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          News, tutorials, and insights from the Vercel ecosystem. Stay up to
          date with the tools and techniques shaping the modern web.
        </p>
        <div className="mt-8">
          <Link
            href="/search"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent/80"
          >
            Browse Articles
          </Link>
        </div>
      </div>
    </section>
  );
}
