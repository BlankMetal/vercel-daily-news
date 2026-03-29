# Vercel Daily News — Build Plan

A step-by-step plan to build the assignment in manageable chunks. Each phase produces something you can run, verify in the browser, and explain confidently before moving on.

---

## Phase 1: Project Foundation & API Layer

**Goal:** Dev environment, Vercel deployment, shared layout, global styles, and a working API client — the skeleton everything else hangs on.

**Lessons applied:** Project Setup, App Router Basics, Environment and Security, Nested Layouts, Fonts, CSS Styling

### Steps

1. **Nix + direnv** — Add a `flake.nix` with Node.js 24, pnpm, and turbo in the dev shell. Add an `.envrc` with `use flake`. Run `direnv allow` so the correct toolchain activates automatically when you `cd` into the project.
2. **Deploy to Vercel** — Run `vercel link` to connect the project, then push to trigger an initial deployment. This gives you a live URL from day one and preview deployments on every subsequent push. Pull env vars with `vercel env pull`.
3. **Environment setup** — Add the API base URL and bypass token to `.env.local` as server-only env vars (no `NEXT_PUBLIC_` prefix since these should never reach the browser). Add the required `<meta name="generator" content="vnews-cert-v3">` tag and `theme-color` meta tag (`#1a1a2e`) to the root layout as noted in the OpenAPI spec's `x-generated` field. Add these env vars to the Vercel project as well via the dashboard or `vercel env add`.
4. **API client** — Create a `lib/api.ts` module with typed fetch helpers for each endpoint (`getArticles`, `getArticle`, `getTrendingArticles`, `getBreakingNews`, `getCategories`, `createSubscription`, `getSubscription`, `subscribe`, `unsubscribe`). Use the `x-vercel-protection-bypass` header on every request. Define TypeScript types for `Article`, `BreakingNews`, `Category`, `Subscription`, `ContentBlock`, and the API response envelope.
5. **Root layout** — Set up `app/layout.tsx` with DM Sans font (via `next/font`), dark-themed Tailwind styles using Blank Metal brand colors (magenta `#FF33FF`, coral `#FF6B6B`, dark surfaces), and root metadata with Open Graph defaults (title template `"%s | Vercel Daily News"`, default description from the publication config endpoint).
6. **Header component** — Persistent header with logo text ("Vercel Daily") and nav links to `/` and `/search`. Leave a slot for the subscription indicator (just a placeholder button for now).
7. **Footer component** — Simple footer with copyright and dynamic year.
8. **Verify** — `pnpm dev` loads on `:3000`, shows the header/footer shell on every route, no console errors. Test the API client by temporarily logging a fetch in the homepage. Push and confirm the Vercel preview deployment works.

**Commit, push, and verify the Vercel deployment.**

---

## Phase 2: Homepage

**Goal:** A complete homepage with hero, breaking news, and article grid.

**Lessons applied:** Data Fetching Without Waterfalls, Server Components, Suspense and Streaming, Images, Cache Components, Core Web Vitals

### Steps

1. **Hero section** — Static Server Component with headline text, a description, and a visual element. Dark surface background, magenta accent on the tagline badge and primary CTA, coral for secondary elements.
2. **Breaking news banner** — Fetch from `GET /breaking-news`. Wrap in a Suspense boundary with a skeleton fallback so the rest of the page streams instantly. Consider using `"use cache"` with a short revalidation since the API returns random items.
3. **Featured articles grid** — Fetch from `GET /articles?featured=true`. Display 6+ articles in a responsive grid. Each card shows the image (via `next/image` with proper `sizes`), headline, category badge, publish date, and links to `/articles/[slug]`. Wrap in Suspense with a skeleton grid fallback.
4. **Parallel data fetching** — Ensure the breaking news and featured articles fetches happen in parallel (not waterfall). Use the pattern of starting both fetches before awaiting, or use separate Server Components each wrapped in their own Suspense.
5. **Cache** — Apply `"use cache"` to data-fetching functions where appropriate. The featured articles list is a good candidate.
6. **Verify** — Homepage renders with real data, images load, responsive on mobile, Suspense fallbacks flash briefly on slow network (throttle in DevTools to confirm streaming works).

**Commit after verifying.**

---

## Phase 3: Article Detail Page (without paywall)

**Goal:** Dynamic article pages with full content rendering and trending sidebar.

**Lessons applied:** Dynamic Routing, params vs searchParams, Suspense and Streaming, Images, Dynamic Metadata, Component Composition Patterns

### Steps

1. **Route setup** — Create `app/articles/[slug]/page.tsx`. Accept params, fetch article from `GET /articles/{slug}`.
2. **Dynamic metadata** — Export a `generateMetadata` function that fetches the article and returns title, description (excerpt), and Open Graph metadata including the article image.
3. **Article header** — Render headline, author name, category badge, and formatted publish date.
4. **Featured image** — Full-width hero image using `next/image` with `priority` since it's above the fold.
5. **Article content renderer** — Build a `ContentRenderer` component that maps the `ContentBlock[]` array to JSX (paragraph, heading, blockquote, lists, images). This is a Server Component — no client JS needed.
6. **Trending articles** — Fetch from `GET /articles/trending?exclude={currentArticleId}`. Wrap in its own Suspense boundary so the main article content streams first, then trending loads independently. Display 3-4 cards.
7. **Subscribe CTA** — Add a placeholder CTA section below the article ("Subscribe to read more" box). Wire it up in Phase 4.
8. **Not found handling** — If the API returns 404, call `notFound()` so Next.js renders the not-found page.
9. **Verify** — Click an article from the homepage, full content renders, trending articles appear after a moment, metadata shows correctly in the browser tab. Test a bad slug to confirm the 404 page.

**Commit after verifying.**

---

## Phase 4: Subscription & Paywall

**Goal:** Cookie-based subscription flow with paywall enforcement on article pages.

**Lessons applied:** Server Actions for Forms, Client-Server Component Boundaries, Cookies/Session Persistence, Middleware/Proxy Basics, Security Review

### Steps

1. **Server Actions** — Create `lib/actions.ts` with Server Actions:
   - `subscribeAction()` — calls `POST /subscription/create` to get a token, then `POST /subscription` to activate it. Stores the token in an HTTP-only cookie. Revalidates the current path.
   - `unsubscribeAction()` — reads the token from the cookie, calls `DELETE /subscription`. Removes the cookie. Revalidates.
2. **Subscription helper** — Create a `lib/subscription.ts` helper that reads the cookie and calls `GET /subscription` to check status. Returns `{ isSubscribed: boolean }`. This runs on the server (uses `cookies()` from `next/headers`).
3. **Header subscription indicator** — Make the header read subscription status. Show "Subscribe" button (triggers `subscribeAction`) when not subscribed, show "Subscribed" badge + "Unsubscribe" button when subscribed. The subscribe/unsubscribe buttons are Client Components (for the form), but the status check is server-side.
4. **Paywall on article page** — In the article detail page, check subscription status. If not subscribed: show the article header, featured image, first paragraph only (teaser), then a prominent "Subscribe to continue reading" CTA with the subscribe action. If subscribed: show everything.
5. **Subscribe CTA component** — A reusable component used on the article page (both in the paywall and the sidebar CTA from Phase 3). Contains a form that calls `subscribeAction`.
6. **Verify** — Start unsubscribed: article pages show paywall. Click subscribe: cookie is set, page reloads showing full content, header shows "Subscribed". Refresh the page — still subscribed. Click unsubscribe — back to paywall. Check that the cookie persists across navigation.

**Commit after verifying.**

---

## Phase 5: Search Page

**Goal:** Server-side search with URL persistence, category filtering, and proper loading states.

**Lessons applied:** params vs searchParams, Server Actions for Forms, Data Fetching, Suspense and Streaming, Adding Search and Pagination, Component Composition Patterns

### Steps

1. **Route setup** — Create `app/search/page.tsx`. Read `searchParams` for `q` (search query) and `category` (filter).
2. **Page metadata** — Export metadata with title "Search | Vercel Daily News".
3. **Search form** — A Client Component with a text input and category dropdown. On submit (Enter or button click), update the URL search params using `useRouter().push()` or a form action. Also trigger automatically when the user types 3+ characters (debounced).
4. **Category dropdown** — Fetch categories from `GET /categories` on the server and pass them as props to the search form. The dropdown updates the `category` search param.
5. **Search results** — A Server Component that reads `searchParams`, fetches `GET /articles?search={q}&category={category}&limit=5`. Display results in a responsive grid using the same article card component from the homepage.
6. **Default state** — When no search params, fetch recent articles (no filters, maybe `limit=5`) and display them.
7. **Empty state** — When search returns zero results, show a friendly "No articles found" message.
8. **Loading state** — Wrap the results in a Suspense boundary with a skeleton fallback. Since searchParams change triggers a new server render, the Suspense fallback shows each time.
9. **URL persistence** — Verify that refreshing the page or sharing the URL preserves the search query and category filter.
10. **Verify** — Search for a term, results appear. Filter by category. Refresh — same results. Clear search — default articles show. Search for gibberish — empty state. Check loading skeletons appear.

**Commit after verifying.**

---

## Phase 6: Polish, Performance & Deploy

**Goal:** Final quality pass, then ship it.

**Lessons applied:** Core Web Vitals, Advanced Image Optimization, Dynamic Metadata, Security Review, Third-Party Scripts, Cache Components

### Steps

1. **Metadata audit** — Verify every page has correct `<title>`, description, and Open Graph tags. Check with browser DevTools or a social card preview tool.
2. **Image optimization** — Ensure all `next/image` usages have proper `sizes`, `width`/`height` or `fill`, and appropriate `priority` for above-the-fold images. Use `placeholder="blur"` where applicable.
3. **Cache review** — Audit `"use cache"` usage. Ensure data that should be fresh (breaking news, subscription status) isn't over-cached. Ensure stable data (article content, categories) is cached appropriately.
4. **Error boundaries** — Add `error.tsx` at the root and/or in `articles/[slug]` for graceful error handling. Add a `not-found.tsx` for custom 404 pages.
5. **Responsive check** — Test all pages on mobile, tablet, and desktop viewports. Fix any layout issues.
6. **Security check** — Confirm the API bypass token is never exposed to the client (no `NEXT_PUBLIC_` prefix, only used in server-side fetches). Confirm cookies are set with appropriate flags.
7. **Lighthouse** — Run a Lighthouse audit. Target 90+ on Performance, Accessibility, Best Practices, SEO.
8. **Deploy to Vercel** — Push to main, verify the production build succeeds, test the deployed URL.
9. **Final verify** — Walk through every feature on the deployed site as if you're recording the video. Make sure you can explain each decision.

**Commit and deploy.**

---

## Architecture Summary (for your video)

| Concept | Where it's used | Why |
| --- | --- | --- |
| **Server Components** | All pages, article renderer, article cards | No client JS for read-only content |
| **Client Components** | Search form, subscribe/unsubscribe buttons | Need interactivity (input, form submission) |
| **`"use cache"`** | Article list, categories, article detail | Instant loads for stable data |
| **Suspense boundaries** | Breaking news, trending articles, search results | Stream content progressively, show skeletons |
| **Server Actions** | Subscribe, unsubscribe | Mutate state without API routes |
| **Dynamic Metadata** | Article detail `generateMetadata` | SEO and social sharing per article |
| **`next/image`** | Article cards, hero images | Automatic optimization, proper sizing |
| **`next/font`** | Root layout | No layout shift from font loading |
| **Cookies** | Subscription token | Session persistence without auth |
| **searchParams** | Search page | URL-persisted search state |
| **`notFound()`** | Article detail | Graceful 404 for missing articles |
| **Error boundaries** | `error.tsx` | Graceful error recovery |
