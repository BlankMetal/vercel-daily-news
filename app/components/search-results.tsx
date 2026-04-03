import { getArticles } from "@/lib/api";
import { ArticleCard } from "./article-card";

export async function SearchResults({
  query,
  category,
}: {
  query?: string;
  category?: string;
}) {
  const hasFilters = query || category;

  const { data: articles } = await getArticles({
    search: query,
    category,
    limit: hasFilters ? 6 : 12,
  });

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold">
        {hasFilters
          ? `Search Results (${articles.length})`
          : "Recent Articles"}
      </h2>

      {articles.length === 0 ? (
        <p className="py-12 text-center text-muted">
          No articles found. Try a different search term or category.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
