# Phase 6: Polish, Performance & Deploy

Final quality pass against the evaluation rubric. The app is already deployed to production — this phase is about filling gaps, hardening edge cases, and ensuring every dimension the reviewers check is covered.

---

## Evaluation Checklist (what reviewers look for)

| Dimension | Current Status | Gap |
| --- | --- | --- |
| **Caching Strategy** | 4 components use `"use cache"` with `cacheLife` and `cacheTag` | None — good coverage |
| **Component Architecture** | Only 3 `"use client"` files, all justified | None |
| **Suspense & Streaming** | Suspense boundaries on homepage, article page, search page with skeleton fallbacks | None |
| **Server Actions & Forms** | Subscribe/unsubscribe via Server Actions, `useFormStatus` for pending states | None |
| **Metadata & SEO** | Root layout + article `generateMetadata` + search title | Search page missing description; no `metadataBase` (OG URLs are relative) |
| **Data Fetching Patterns** | Parallel fetching via composition, dynamic routing, `notFound()` on 404 | No `generateStaticParams` |
| **Code Quality & Polish** | Clean code, responsive, functional e2e | Missing `error.tsx`, cookie `secure` flag, search input `<label>` |

---

## Steps

### Step 1: Add `metadataBase` to root layout

**Why:** Without `metadataBase`, Open Graph image URLs are relative — social platforms and crawlers can't resolve them. The metadata lesson says: "Never use relative URLs in `generateMetadata` — server doesn't know domain." Setting `metadataBase` in the root layout makes all child metadata URLs absolute automatically.

**Changes:**
- `app/layout.tsx` — Add `metadataBase: new URL("https://vercel-daily-news-ten.vercel.app")` to the root metadata export.

---

### Step 2: Enhance search page metadata

**Why:** The search page only exports `title: "Search"`. Reviewers check for page-level metadata on every route. Adding a description and inheriting the root OG config is minimal effort.

**Changes:**
- `app/search/page.tsx` — Expand metadata to include `description`.

---

### Step 3: Add `error.tsx` error boundary

**Why:** The evaluation rubric explicitly lists "error boundaries" under Code Quality & Polish. Currently there's no `error.tsx` anywhere — an unhandled API failure would show the default Next.js error page. The error handling lesson teaches that `error.tsx` must be a Client Component (it wraps in React's `ErrorBoundary`).

**Changes:**
- `app/error.tsx` — Client Component with a friendly error message and a "Try Again" button that calls `reset()`. Styled to match the brand.

---

### Step 4: Add `secure` flag to subscription cookie

**Why:** The security review lesson flags this: cookies without `secure: true` can be sent over plain HTTP, exposing the token. Since production runs on HTTPS, this is a one-line hardening fix.

**Changes:**
- `lib/actions.ts` — Add `secure: process.env.NODE_ENV === "production"` to the cookie options.

---

### Step 5: Add `aria-label` to search input

**Why:** The accessibility lesson says inputs need associated labels. The search input uses `placeholder` as its label — screen readers may not announce it. Adding an `aria-label` fixes this without changing the visual design.

**Changes:**
- `app/components/search-form.tsx` — Add `aria-label="Search articles"` to the `<input>`.

---

### Step 6: Add `generateStaticParams` to article page

**Why:** The evaluation rubric lists `generateStaticParams` under Data Fetching Patterns. This tells Next.js which article slugs to prerender at build time, so popular articles are instantly available from the CDN instead of requiring a server render on first visit.

**Changes:**
- `app/articles/[slug]/page.tsx` — Export a `generateStaticParams` function that fetches article slugs from the API.

---

### Step 7: Quick Lighthouse check and fixes

**Why:** Catch any low-hanging performance or accessibility issues. Not aiming for perfection — just ensuring nothing obviously broken.

**Changes:**
- Run Lighthouse on homepage, an article page, and search page.
- Fix any critical issues (score < 80 in any category).

---

## Files changed summary

| File | Change |
| --- | --- |
| `app/layout.tsx` | Add `metadataBase` |
| `app/search/page.tsx` | Expand metadata |
| `app/error.tsx` | **New** — root error boundary |
| `lib/actions.ts` | Add `secure` cookie flag |
| `app/components/search-form.tsx` | Add `aria-label` |
| `app/articles/[slug]/page.tsx` | Add `generateStaticParams` |

---

## Video talking points

- **Error boundaries** — `error.tsx` is a Client Component because React's `ErrorBoundary` API requires `componentDidCatch`, which only works in client-side React. The `reset()` function re-renders the route segment without a full page reload.
- **`metadataBase`** — One line in the root layout that makes every OG image URL absolute. Without it, social cards break silently.
- **`generateStaticParams`** — Prerendering article pages at build time. Combined with PPR (`cacheComponents`), the static shell serves instantly and dynamic content streams in.
- **Cookie `secure` flag** — Defense-in-depth: `httpOnly` prevents XSS token theft, `sameSite: "lax"` prevents CSRF, `secure` prevents network sniffing.
- **Minimal Client Components** — Only 3 files use `"use client"`: search form (needs `useRouter`, `useSearchParams`), subscribe button (needs `useFormStatus`), subscribed badge (needs `useFormStatus`). Everything else is a Server Component — zero client JS for read-only content.
