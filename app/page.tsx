import { Suspense } from "react";
import { Hero } from "./components/hero";
import { BreakingNewsBanner } from "./components/breaking-news-banner";
import { FeaturedArticles } from "./components/featured-articles";
import { LatestArticles } from "./components/latest-articles";
import {
  BreakingNewsSkeleton,
  ArticleGridSkeleton,
} from "./components/skeletons";

export default function HomePage() {
  return (
    <>
      <Hero />

      <Suspense fallback={<BreakingNewsSkeleton />}>
        <BreakingNewsBanner />
      </Suspense>

      <Suspense fallback={<ArticleGridSkeleton />}>
        <FeaturedArticles />
      </Suspense>

      <Suspense fallback={<ArticleGridSkeleton count={12} />}>
        <LatestArticles />
      </Suspense>
    </>
  );
}
