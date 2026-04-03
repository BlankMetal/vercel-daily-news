# Phase 5: Search Page

**Goal:** Server-side search with URL persistence, category filtering, debounced input, and proper loading states.

**Lessons applied:** params vs searchParams, Adding Search and Pagination, Data Fetching, Suspense and Streaming, Component Composition Patterns

---

## Architecture Overview

The search page follows the same Server Component + Client Component split pattern from the lessons:
- **Page component** (Server) — reads `searchParams`, fetches categories, renders results
- **Search form** (Client) — text input + search button + category pills, updates URL via `useRouter().replace()`
- **Results** (Server) — reuses `ArticleCard`, wrapped in Suspense with skeleton fallback

URL structure: `/search?q=vercel&category=technology`

Since `searchParams` makes the route dynamic (cannot be prerendered), the page shell (heading + search form) renders first, then results stream in via Suspense.

---

## Steps

### Step 1: Install `use-debounce`

```bash
pnpm add use-debounce
```

The `use-debounce` library provides `useDebouncedCallback` for throttling URL updates as the user types (pattern from Next.js Learn Chapter 10).

---

### Step 2: Search form (Client Component)

**Create `app/components/search-form.tsx`**

- `"use client"` directive
- Props: `categories: Category[]`, `defaultQuery?: string`, `defaultCategory?: string`
- Text input with `defaultValue` synced from URL params
- Magnifying glass icon inside the input (decorative)
- Visible search button next to the input (assignment requires Enter, button click, and auto-trigger)
- Category pills rendered dynamically from the categories array, plus an "All" pill
- Active pill highlighted with accent styling (border-accent, bg-accent/10)
- Uses `useSearchParams` + `useRouter` + `usePathname` for URL updates
- Debounced auto-search (300ms) via `useDebouncedCallback` — triggers when input length >= 3
- On Enter or button click: immediate URL update (bypasses debounce)
- When category pill is clicked: update `category` param immediately

Must be wrapped in `<Suspense>` in the parent page because `useSearchParams` requires it in statically renderable contexts.

---

### Step 3: Search results (Server Component)

**Create `app/components/search-results.tsx`**

- Async Server Component
- Props: `query?: string`, `category?: string`
- Fetching logic:
  - No query and no category → `getArticles({ limit: 12 })` — shows "Recent Articles"
  - Query or category present → `getArticles({ search: query, category, limit: 5 })` — shows "Search Results"
- Renders results using the existing `ArticleCard` in a responsive grid (`sm:grid-cols-2 lg:grid-cols-3`)
- Empty state: friendly "No articles found" message when zero results
- Heading: "Recent Articles" (default) vs "Search Results" with count (when filtering)

---

### Step 4: Skeleton fallback

**Edit `app/components/skeletons.tsx`**

Add a `SearchResultsSkeleton` component that reuses `ArticleGridSkeleton`. Accept a `count` prop to match the expected number of results (12 for default, 5 for search).

---

### Step 5: Search page route

**Create `app/search/page.tsx`**

- Export static metadata: `{ title: "Search" }`
- Accept `searchParams` prop typed as `Promise<{ q?: string; category?: string }>`
- Await `searchParams` to extract `q` and `category`
- Fetch categories server-side via `getCategories()` — passed as props to the search form
- Layout:
  1. Page heading
  2. `<Suspense>` around `<SearchForm>` (required for `useSearchParams`)
  3. `<Suspense key={q + category}>` around `<SearchResults>` with `SearchResultsSkeleton` fallback
- The `key` prop on Suspense re-triggers the fallback when params change (pattern from Next.js Learn Chapter 10)

---

### Step 6: Verify

- [ ] `/search` loads with 12 recent articles and "Recent Articles" heading
- [ ] Type a search term (3+ chars) — results update after debounce, heading changes to "Search Results"
- [ ] Press Enter or click search button — immediate search
- [ ] Click a category pill — results filter, URL updates with `?category=...`
- [ ] Combine search + category filter — both params in URL
- [ ] Refresh the page — same results appear (URL persistence)
- [ ] Copy URL and open in new tab — same filtered view (shareable)
- [ ] Search for gibberish — empty state message appears
- [ ] Skeleton fallback visible when throttling network in DevTools
- [ ] Responsive: pills wrap on mobile, grid collapses to single column

---

## File changes summary

| File | Action |
|---|---|
| `package.json` | Edit — add `use-debounce` |
| `app/components/search-form.tsx` | Create — Client Component with input, button, and category pills |
| `app/components/search-results.tsx` | Create — Server Component rendering article grid |
| `app/components/skeletons.tsx` | Edit — add `SearchResultsSkeleton` |
| `app/search/page.tsx` | Create — page route wiring it all together |

---

## Key concepts for video

- **`searchParams` as Promise** — Next.js 16 requires awaiting before access
- **Client/Server split** — form is client (interactivity), results are server (zero JS shipped for the grid)
- **URL-driven state** — bookmarkable, shareable, works on refresh; no `useState` for search
- **Debounce** — `useDebouncedCallback` prevents excessive server renders on every keystroke
- **`Suspense key` trick** — changing the key on param updates forces the fallback to show, giving visual loading feedback
- **Category pills from server** — fetched once server-side and passed as props, avoiding a client-side fetch
