# Phase 2: Homepage — Detailed Plan

**Goal:** Build a complete homepage with hero section, breaking news banner, and featured articles grid — all powered by real API data, with proper streaming, caching, and image optimization.

**Lessons applied:** Data Fetching Without Waterfalls, Server Components, Suspense and Streaming, Images, Cache Components, Core Web Vitals

---

## Pre-requisites

Before writing any components, we need to configure two things:

### Step 1: Enable Cache Components

Add `cacheComponents: true` to `next.config.ts`. This unlocks `"use cache"`, Suspense-based streaming, and Partial Prerendering (PPR) — the core of how Next.js 16 mixes static, cached, and dynamic content in a single route.

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

**Why:** The assignment requires Cache Components. With this flag, our page will have three content tiers:
- **Static** — The hero section (no async, prerendered at build time)
- **Cached** — Featured articles (`"use cache"` with `cacheLife`)
- **Dynamic** — Breaking news (wrapped in `<Suspense>`, streams in)

**Next.js concept:** This replaces the old `experimental.ppr` flag from earlier Next.js versions.

**Commit after this step.**

### Step 2: Configure remote images

The API serves article images from `i8qy5y6gxkdgdcv9.public.blob.vercel-storage.com`. We need to allow this domain in `next.config.ts` so `next/image` can optimize them.

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      new URL("https://i8qy5y6gxkdgdcv9.public.blob.vercel-storage.com/**"),
    ],
  },
};
```

**Why:** `next/image` blocks remote images by default for security. The `remotePatterns` allowlist tells Next.js which external hosts are trusted. Using `new URL()` syntax is the modern approach (v15.3+).

**Next.js concept:** Image optimization — Next.js automatically resizes, converts to WebP/AVIF, and lazy-loads images. We just need to tell it which hosts to trust.

**Commit after this step.**

---

## Building the Homepage

### Step 3: Hero section (Static Server Component)

Create a hero section at the top of the homepage. This is a pure Server Component with no data fetching — just headline text, a description, and a CTA button. Because it's synchronous, Next.js prerenders it at build time (the "static" tier of PPR).

**File:** `app/components/hero.tsx`

**What it contains:**
- Large headline ("The Latest in Web Development")
- Supporting description paragraph
- "Browse Articles" link/button
- Clean, prominent styling with good whitespace

**Why static:** The hero doesn't fetch data, so it renders instantly. This gives users immediate visual content while the breaking news and articles stream in below.

**Next.js concept:** Static content in PPR — synchronous Server Components are prerendered at build time and served from the CDN edge. Zero JavaScript sent to the client.

**Commit after this step.**

### Step 4: Breaking news banner (Dynamic, Suspense)

Fetch from `GET /breaking-news` and display a banner. The API returns a random breaking news item on each request, so this must be dynamic (not cached). Wrap it in a `<Suspense>` boundary with a skeleton fallback so the hero section and the rest of the page stream instantly while this resolves.

**File:** `app/components/breaking-news-banner.tsx`

**Architecture:**
```
<Suspense fallback={<BreakingNewsSkeleton />}>
  <BreakingNewsBanner />     ← async Server Component, fetches on every request
</Suspense>
```

**What it shows:**
- "BREAKING" badge (red/urgent styling if `urgent: true`)
- Headline text
- Link to the related article (`/articles/[slug]`) — we'll need to look up the article slug from the `articleId`, or link to `/articles/{articleId}` since our API accepts both ID and slug

**Skeleton fallback:** A placeholder with the same height/shape as the real banner — a colored bar with a pulsing animation. This prevents CLS (Cumulative Layout Shift) when the real content streams in.

**Why cached with a short lifetime:** The API returns a random item on each request, but showing a different headline on every refresh undermines the "breaking" urgency. We use `"use cache"` with `cacheLife("minutes")` so the same headline sticks for ~5 minutes, then revalidates in the background. Still wrapped in Suspense for the cold-cache case.

**Next.js concept:** Suspense streaming — the static shell (hero) is sent to the browser first. When the breaking news fetch resolves, React streams in the real content, replacing the skeleton. The user sees something useful immediately instead of waiting for all data.

**Commit after this step.**

### Step 5: Article card component (Shared, reusable)

Before building the grid, create a reusable `ArticleCard` component that we'll use on the homepage, search page, and trending sidebar.

**File:** `app/components/article-card.tsx`

**What it shows:**
- Article image via `next/image` with proper `sizes` attribute for responsive behavior
- Category badge
- Headline (linked to `/articles/[slug]`)
- Formatted publish date (use `Intl.DateTimeFormat` or a simple date formatter)
- Excerpt (truncated if needed)

**Image considerations:**
- Use `next/image` with `fill` + `sizes` for responsive images in a card layout
- Set `sizes` to something like `"(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` so the browser requests the right size
- Don't set `priority` — these are below the fold; lazy loading is correct

**Next.js concept:** `next/image` automatically generates `srcset` with multiple sizes, converts to WebP/AVIF, and lazy-loads images below the fold. The `sizes` attribute tells the browser which size to pick before layout is calculated, avoiding wasted bandwidth.

**Commit after this step.**

### Step 6: Featured articles grid (Cached, Suspense)

Fetch featured articles from `GET /articles?featured=true` and display them in a responsive grid of 6+ cards. This data is stable (same articles until the API changes), so it's a great candidate for `"use cache"`.

**File:** `app/components/featured-articles.tsx`

**Architecture:**
```
<Suspense fallback={<ArticleGridSkeleton />}>
  <FeaturedArticles />     ← async Server Component with "use cache"
</Suspense>
```

**Data fetching with cache:**
```tsx
async function FeaturedArticles() {
  "use cache";
  cacheLife("hours");    // revalidate every few hours
  cacheTag("featured-articles");

  const { data: articles } = await getArticles({ featured: true });
  return (
    <section>
      <h2>Featured Stories</h2>
      <div className="grid ...">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
```

**Grid layout:** Responsive CSS grid — 1 column on mobile, 2 on tablet, 3 on desktop. Use Tailwind's `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` pattern.

**Skeleton fallback:** A grid of placeholder cards with the same dimensions, using `animate-pulse` backgrounds. Match the card count (6) so the skeleton doesn't cause layout shift when real content loads.

**Why `"use cache"` here:** Featured articles don't change on every request. Caching with `cacheLife("hours")` means the first request fetches from the API, then subsequent requests serve from cache until revalidation. This makes the page fast for repeat visitors and reduces API load.

**Why also wrap in Suspense:** Even though the data is cached, the first request (cold cache) still needs to fetch. Suspense ensures the page shell streams immediately regardless. On warm cache hits, the component resolves near-instantly and the skeleton barely flashes.

**Next.js concept:** `"use cache"` + Suspense = the "cached" tier of PPR. The component is cached at the server level, but still wrapped in Suspense for the cold-cache case. The `cacheTag` lets us invalidate this specific cache later if needed (e.g., after publishing a new article).

**Commit after this step.**

### Step 7: Assemble the homepage

Wire everything together in `app/page.tsx`. Replace the default Next.js starter content with our real homepage.

**File:** `app/page.tsx`

**Structure:**
```tsx
import { Suspense } from "react";
import { Hero } from "./components/hero";
import { BreakingNewsBanner } from "./components/breaking-news-banner";
import { FeaturedArticles } from "./components/featured-articles";
// + skeleton components

export default function HomePage() {
  return (
    <>
      {/* Static — prerendered, instant from CDN */}
      <Hero />

      {/* Dynamic — streams in, fresh on every request */}
      <Suspense fallback={<BreakingNewsSkeleton />}>
        <BreakingNewsBanner />
      </Suspense>

      {/* Cached — fast from cache, streams on cold miss */}
      <Suspense fallback={<ArticleGridSkeleton />}>
        <FeaturedArticles />
      </Suspense>
    </>
  );
}
```

**Key pattern — parallel data fetching:** Because the breaking news and featured articles are in *separate* Suspense boundaries, they fetch in parallel automatically. Neither blocks the other. This is the React/Next.js pattern for avoiding waterfalls — instead of `await fetch1(); await fetch2();` sequentially, each component owns its own data and resolves independently.

**Next.js concept:** Partial Prerendering (PPR) in action — a single route with three tiers of content. The static shell streams instantly, then cached and dynamic content fill in as they resolve. No client-side JavaScript needed for any of this; it's all Server Components.

**Commit after this step.**

### Step 8: Verify and push

Run through this checklist before committing:

- [ ] `pnpm dev` — homepage loads with real API data
- [ ] Hero section appears immediately (no loading flash)
- [ ] Breaking news banner shows a skeleton briefly, then real content
- [ ] Featured articles grid shows a skeleton, then 6+ article cards
- [ ] Article images load and are optimized (check network tab for `/_next/image` URLs)
- [ ] Layout is responsive: 1 col on mobile, 2 on tablet, 3 on desktop
- [ ] No console errors
- [ ] Throttle network in DevTools to "Slow 3G" — confirm streaming behavior (hero appears first, then banners/articles fill in)
- [ ] Refresh the page — cached data loads faster on second request

**Push to main and verify on the production URL.**

---

## Architecture Diagram

```
app/page.tsx (Homepage)
├── <Hero />                          [STATIC]   Prerendered at build
├── <Suspense fallback={skeleton}>
│   └── <BreakingNewsBanner />        [CACHED]   "use cache" + cacheLife("minutes")
└── <Suspense fallback={skeleton}>
    └── <FeaturedArticles />          [CACHED]   "use cache" + cacheLife("hours")
        └── <ArticleCard /> × N       [STATIC]   Pure render, no own data
```

## Components Created

| Component | File | Type | Client JS? |
|-----------|------|------|-----------|
| `Hero` | `app/components/hero.tsx` | Static Server Component | No |
| `BreakingNewsBanner` | `app/components/breaking-news-banner.tsx` | Dynamic Server Component | No |
| `BreakingNewsSkeleton` | `app/components/skeletons.tsx` | Static Server Component | No |
| `ArticleCard` | `app/components/article-card.tsx` | Static Server Component | No |
| `FeaturedArticles` | `app/components/featured-articles.tsx` | Cached Server Component | No |
| `ArticleGridSkeleton` | `app/components/skeletons.tsx` | Static Server Component | No |

All components are Server Components — zero client-side JavaScript for the entire homepage.

## API Calls

| Endpoint | Where | Caching |
|----------|-------|---------|
| `GET /breaking-news` | `BreakingNewsBanner` | `"use cache"` + `cacheLife("minutes")` |
| `GET /articles?featured=true` | `FeaturedArticles` | `"use cache"` + `cacheLife("hours")` |

Both fetches happen in parallel thanks to separate Suspense boundaries.
