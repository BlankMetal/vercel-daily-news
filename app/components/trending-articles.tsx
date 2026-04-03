import { cacheLife, cacheTag } from "next/cache";
import { getTrendingArticles } from "@/lib/api";
import { ArticleCard } from "./article-card";

export async function TrendingArticles({ excludeId }: { excludeId: string }) {
  "use cache";
  cacheLife("hours");
  cacheTag("trending-articles");

  const articles = await getTrendingArticles(excludeId);

  if (articles.length === 0) return null;

  return (
    <aside className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h2 className="mb-8 text-2xl font-bold tracking-tight">
        Trending Articles
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.slice(0, 3).map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </aside>
  );
}
