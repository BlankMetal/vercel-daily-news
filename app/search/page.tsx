import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories } from "@/lib/api";
import { SearchForm } from "@/app/components/search-form";
import { SearchResults } from "@/app/components/search-results";
import { SearchResultsSkeleton } from "@/app/components/skeletons";

export const metadata: Metadata = {
  title: "Search",
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

async function SearchContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const categories = await getCategories();

  return (
    <>
      <Suspense>
        <SearchForm
          categories={categories}
          defaultQuery={q}
          defaultCategory={category}
        />
      </Suspense>

      <div className="mt-10">
        <Suspense
          key={`${q}-${category}`}
          fallback={<SearchResultsSkeleton count={q || category ? 6 : 12} />}
        >
          <SearchResults query={q} category={category} />
        </Suspense>
      </div>
    </>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Search</h1>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
