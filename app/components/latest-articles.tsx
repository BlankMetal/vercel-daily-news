import { cacheLife, cacheTag } from "next/cache";
import { getArticles } from "@/lib/api";
import { ArticleCard } from "./article-card";

export async function LatestArticles() {
  "use cache";
  cacheLife("hours");
  cacheTag("latest-articles");

  const { data: articles } = await getArticles({ limit: 18 });

  // Exclude featured articles — they're shown in their own section
  const latest = articles.filter((a) => !a.featured);

  if (latest.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="mb-8 text-2xl font-bold tracking-tight">
        Latest Articles
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {latest.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
