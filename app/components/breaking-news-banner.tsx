import Link from "next/link";
import { cacheLife } from "next/cache";
import { getBreakingNews } from "@/lib/api";

export async function BreakingNewsBanner() {
  "use cache";
  cacheLife("minutes");

  const news = await getBreakingNews();

  return (
    <div className="bg-zinc-900 px-4 py-3 text-white dark:bg-zinc-100 dark:text-zinc-900">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <span className="shrink-0 rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
          Breaking
        </span>
        <Link
          href={`/articles/${news.articleId}`}
          className="truncate text-sm font-medium hover:underline"
        >
          {news.headline}
        </Link>
      </div>
    </div>
  );
}
