import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getArticle, getArticles } from "@/lib/api";
import { getSubscriptionStatus } from "@/lib/subscription";
import { ContentRenderer } from "@/app/components/content-renderer";
import { TrendingArticles } from "@/app/components/trending-articles";
import {
  ArticlePageSkeleton,
  TrendingArticlesSkeleton,
} from "@/app/components/skeletons";
import { SubscribeCTA } from "@/app/components/subscribe-cta";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export async function generateStaticParams() {
  const { data: articles } = await getArticles({ limit: 50 });
  return articles.map((article) => ({ slug: article.slug }));
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

async function ArticleContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let article;
  let isSubscribed;
  try {
    [article, { isSubscribed }] = await Promise.all([
      getArticle(slug),
      getSubscriptionStatus(),
    ]);
  } catch {
    notFound();
  }

  const paragraphs = article.content.filter((b) => b.type === "paragraph");
  const visibleBlocks = paragraphs.slice(0, 3);
  const fadedBlocks = paragraphs.slice(3, 5);

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
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

      {isSubscribed ? (
        <>
          <ContentRenderer blocks={article.content} />

          <Suspense fallback={<TrendingArticlesSkeleton />}>
            <TrendingArticles excludeId={article.id} />
          </Suspense>
        </>
      ) : (
        <>
          <ContentRenderer blocks={visibleBlocks} />

          <div className="relative overflow-hidden">
            <ContentRenderer blocks={fadedBlocks} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>

          <SubscribeCTA />
        </>
      )}
    </article>
  );
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return (
    <Suspense fallback={<ArticlePageSkeleton />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}
