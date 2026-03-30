import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/api";
import { ContentRenderer } from "@/app/components/content-renderer";
import { TrendingArticles } from "@/app/components/trending-articles";
import { TrendingArticlesSkeleton } from "@/app/components/skeletons";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  let article;
  try {
    article = await getArticle(slug);
  } catch {
    return {};
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      images: [{ url: article.image, alt: article.title }],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  let article;
  try {
    article = await getArticle(slug);
  } catch {
    notFound();
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Article header */}
      <header>
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          {article.category}
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>
        <div className="mt-6 flex items-center gap-3">
          {article.author.avatar ? (
            <Image
              src={article.author.avatar}
              alt={article.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
              {article.author.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{article.author.name}</p>
            <time
              dateTime={article.publishedAt}
              className="text-sm text-muted"
            >
              {formatDate(article.publishedAt)}
            </time>
          </div>
        </div>
      </header>

      {/* Featured image */}
      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg">
        <Image
          src={article.image}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 896px) 100vw, 896px"
          className="object-cover"
        />
      </div>

      {/* Article content */}
      <ContentRenderer blocks={article.content} />

      {/* Subscribe CTA — wired up in Phase 4 */}
      <div className="mt-12 rounded-lg border border-border bg-surface p-8 text-center">
        <h3 className="text-xl font-bold">Enjoy this article?</h3>
        <p className="mt-2 text-muted">
          Subscribe to Vercel Daily News for full access to all articles.
        </p>
        <button className="mt-4 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent/80">
          Subscribe
        </button>
      </div>

      {/* Trending articles — own Suspense boundary, loads independently */}
      <Suspense fallback={<TrendingArticlesSkeleton />}>
        <TrendingArticles excludeId={article.id} />
      </Suspense>
    </article>
  );
}
