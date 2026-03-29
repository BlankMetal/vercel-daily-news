import { cacheLife, cacheTag } from "next/cache";
import { getArticles } from "@/lib/api";
import { ArticleCard } from "./article-card";

export async function FeaturedArticles() {
  "use cache";
  cacheLife("hours");
  cacheTag("featured-articles");

  const { data: articles } = await getArticles({ featured: true });

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
