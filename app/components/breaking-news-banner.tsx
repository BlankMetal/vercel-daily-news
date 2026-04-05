import Link from "next/link";
import { cacheLife } from "next/cache";
import { getBreakingNews } from "@/lib/api";

export async function BreakingNewsBanner() {
  "use cache";
  cacheLife("minutes");

  const news = await getBreakingNews();

  return (
    <div className="bg-accent/10 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <span className="shrink-0 rounded bg-accent-coral px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-black">
          Breaking
        </span>
        <Link
          href={`/articles/${news.articleId}`}
          className="truncate text-sm font-medium text-white hover:text-accent"
        >
          {news.headline}
        </Link>
      </div>
    </div>
  );
}
