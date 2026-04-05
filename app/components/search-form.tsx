"use client";

import { useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
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

  function handleClear() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    updateParams({ q: undefined });
  }

  function handleCategoryClick(slug: string | undefined) {
    updateParams({ category: slug });
  }

  const activeQuery = searchParams.get("q") || undefined;
  const activeCategory = searchParams.get("category") || undefined;

  return (
    <div className="space-y-4">
      <div className="relative">
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
          ref={inputRef}
          name="q"
          type="text"
          aria-label="Search articles"
          placeholder="Search articles..."
          defaultValue={defaultQuery}
          onChange={(e) => handleDebounced(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {activeQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

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
