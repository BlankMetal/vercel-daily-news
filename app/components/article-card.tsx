import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-lg hover:shadow-accent/5"
    >
      <div className="relative aspect-[16/9]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {article.category}
        </span>
        <h3 className="mt-1 text-lg font-semibold leading-snug group-hover:text-accent">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">
          {article.excerpt}
        </p>
        <time
          dateTime={article.publishedAt}
          className="mt-3 block text-xs text-muted"
        >
          {formatDate(article.publishedAt)}
        </time>
      </div>
    </Link>
  );
}
