"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import type { Category } from "@/lib/types";

export function SearchForm({
  categories,
  defaultQuery,
  defaultCategory,
}: {
  categories: Category[];
  defaultQuery?: string;
  defaultCategory?: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const handleDebounced = useDebouncedCallback((term: string) => {
    if (term.length >= 3 || term.length === 0) {
      updateParams({ q: term || undefined });
    }
  }, 300);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("q") as HTMLInputElement;
    updateParams({ q: input.value || undefined });
  }

  function handleCategoryClick(slug: string | undefined) {
    updateParams({ category: slug });
  }

  const activeCategory = searchParams.get("category") || undefined;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            name="q"
            type="text"
            placeholder="Search articles..."
            defaultValue={defaultQuery}
            onChange={(e) => handleDebounced(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleCategoryClick(undefined)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            !activeCategory
              ? "border border-accent bg-accent/10 text-accent"
              : "border border-border text-muted hover:border-accent/50 hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => handleCategoryClick(cat.slug)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              activeCategory === cat.slug
                ? "border border-accent bg-accent/10 text-accent"
                : "border border-border text-muted hover:border-accent/50 hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
