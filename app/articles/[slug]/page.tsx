import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/api";

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
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {article.title}
      </h1>
      <p className="mt-4 text-muted">{article.excerpt}</p>
    </article>
  );
}
