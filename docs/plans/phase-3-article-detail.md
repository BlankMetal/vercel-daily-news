# Phase 3: Article Detail Page (without paywall)

**Goal:** Dynamic article pages with full content rendering, trending sidebar, and homepage refinements.

**Lessons applied:** Dynamic Routing, params vs searchParams, Suspense and Streaming, Images, Dynamic Metadata, Component Composition Patterns, Cache Components

---

## Steps completed

### 1. Route setup (`app/articles/[slug]/page.tsx`)

Created the dynamic article route. The page accepts `params: Promise<{ slug: string }>` (the async params pattern required by the latest Next.js), fetches the article from `GET /articles/{slug}`, and renders the full detail view.

**Commits:** `ca5674c` Add article detail route with dynamic metadata

### 2. Dynamic metadata (`generateMetadata`)

Exported a `generateMetadata` function that fetches the article and returns title, description (excerpt), Open Graph metadata with article type, published time, author, and image. Wrapped in try/catch — returns empty metadata on failure so the page can still call `notFound()`.

**Commits:** `ca5674c` Add article detail route with dynamic metadata

### 3. Article header

Renders the category badge (uppercase, accent color), headline (`h1`), author avatar (with `next/image` or initial-letter fallback), author name, and formatted publish date using `Intl.DateTimeFormat`.

**Commits:** `c1c0f8f` Add article header with author, category badge, and date

### 4. Featured image

Full-width hero image using `next/image` with `fill`, `priority` (above the fold for LCP), proper `sizes` attribute (`(max-width: 896px) 100vw, 896px`), and `object-cover` in a 16:9 aspect ratio container.

**Commits:** `c433b01` Add featured image with priority loading for LCP

### 5. Content renderer (`app/components/content-renderer.tsx`)

Built a `ContentRenderer` Server Component that maps the `ContentBlock[]` array to JSX. Supports: paragraph, heading (h2/h3), blockquote, unordered-list, ordered-list, and image blocks. Uses `react-markdown` for inline markdown within blocks (bold, links, code). Includes:

- **Bold fix** — API sometimes returns malformed bold markdown (`**bold **text`); a `fixBold()` normalizer corrects this before rendering.
- **Empty image guard** — Skips image blocks with empty `src` to prevent broken images.
- **Styled markdown components** — Custom `<a>` (accent color, external links) and `<code>` (background pill) renderers.

**Commits:**
- `8c918a7` Add content renderer using react-markdown for article blocks
- `9109be4` Skip image content blocks with empty src
- `ed8ef85` Fix malformed bold markdown from API data

### 6. Trending articles (`app/components/trending-articles.tsx`)

Created a `TrendingArticles` async Server Component that fetches from `GET /articles/trending?exclude={currentArticleId}` and displays up to 3 cards. Uses `"use cache"` with `cacheLife("hours")` and `cacheTag("trending-articles")`. Wrapped in its own Suspense boundary on the article page with a `TrendingArticlesSkeleton` fallback so the main article content streams first.

**New files:** `app/components/trending-articles.tsx`
**Modified:** `app/components/skeletons.tsx` (added `TrendingArticlesSkeleton`)

### 7. Subscribe CTA placeholder

Added a placeholder CTA section below the article content — "Enjoy this article? Subscribe to Vercel Daily News for full access." Button is non-functional; wired up in Phase 4.

**Commits:** `5999d5a` Add subscribe CTA placeholder on article page

### 8. Not found handling

If the API fetch throws (404), the page calls `notFound()` so Next.js renders the custom not-found page. Also created a custom `app/not-found.tsx` with brand styling (accent 404 heading, "Back to Home" link).

**Commits:** `30998e5` Add custom 404 page with brand styling

### 9. Homepage refinements (parallel work)

While building Phase 3, refined the homepage to better match the build plan:

- **Simplified `FeaturedArticles`** — Removed the filler logic that mixed recent articles into the featured grid. Now fetches only `featured=true` articles, with an early return if empty.
- **Added `LatestArticles`** (`app/components/latest-articles.tsx`) — New section below featured stories showing non-featured articles (`limit=18`, filtered). Uses `"use cache"` with hourly cache. Wrapped in its own Suspense boundary with a 12-card skeleton.
- **Made `ArticleGridSkeleton` configurable** — Added a `count` prop (default 6) so different sections can show appropriately-sized skeleton grids.

**New files:** `app/components/latest-articles.tsx`
**Modified:** `app/components/featured-articles.tsx`, `app/components/skeletons.tsx`, `app/page.tsx`

---

## Verification checklist

- [x] Click an article from the homepage → full content renders
- [x] Trending articles appear below the article (independent Suspense boundary)
- [x] Dynamic metadata shows correctly in the browser tab
- [x] Bad slug returns the custom 404 page
- [x] Subscribe CTA placeholder is visible
- [x] Homepage shows Featured + Latest sections with proper skeletons
