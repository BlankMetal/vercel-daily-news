import { cacheLife, cacheTag } from "next/cache";
import { getArticles } from "@/lib/api";
import { ArticleCard } from "./article-card";

export async function FeaturedArticles() {
  "use cache";
  cacheLife("hours");
  cacheTag("featured-articles");

  const [featured, recent] = await Promise.all([
    getArticles({ featured: true }),
    getArticles({ limit: 6 }),
  ]);

  const featuredIds = new Set(featured.data.map((a) => a.id));
  const filler = recent.data.filter((a) => !featuredIds.has(a.id));
  const articles = [...featured.data, ...filler].slice(0, 6);

  return (
    <section id="featured" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="mb-8 text-2xl font-bold tracking-tight">
        Featured Stories
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
