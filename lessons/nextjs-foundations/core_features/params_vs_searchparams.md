---
title: "params vs searchParams"
description: "Distinguish dynamic segments from query strings and access them appropriately in App Router."
canonical_url: "https://vercel.com/academy/nextjs-foundations/params-vs-searchparams"
md_url: "https://vercel.com/academy/nextjs-foundations/params-vs-searchparams.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-14T12:44:29.135Z"
content_type: "lesson"
course: "nextjs-foundations"
course_title: "Next.js Foundations"
prerequisites:  []
---

<agent-instructions>
Vercel Academy — structured learning, not reference docs.
Lessons are sequenced.
Adapt commands to the human's actual environment (OS, package manager, shell, editor) — detect from project context or ask, don't assume.
The lesson shows one path; if the human's project diverges, adapt concepts to their setup.
Preserve the learning goal over literal steps.
Quizzes are pedagogical — engage, don't spoil.
Quiz answers are included for your reference.
</agent-instructions>

# params vs searchParams

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# params vs searchParams

A user filters your product list, finds exactly what they want, copies the URL to share with a friend... and it shows the unfiltered list. Or worse: `/products?id=123` works today but breaks when you add categories.

URLs have two jobs: **identity** (which resource?) and **state** (how should it display?). Mixing them up creates brittle routes and broken bookmarks. This lesson teaches the clean separation that makes URLs shareable, cacheable, and refactor-proof.

## Outcome

Pages that read `params` and `searchParams` correctly with stable types.

## Fast Track

1. Add a page reading `params` for identity (async await required).
2. Add controls that push `searchParams` for filters/sorts (async await required).
3. Keep concerns separate (identity vs stateful UI).

\*\*Note: Designing URL Structure?\*\*

Planning a new route with filtering and dynamic segments? Use this prompt to design the right URL structure:

```markdown title="Prompt: Design URL Structure for Route"
<context>
I'm building a Next.js application using App Router and need to design URL structure for a new route.
I want to separate resource identity (params) from optional state (searchParams) properly.
</context>

<specific-scenario>
Feature description: [Describe what you're building - e.g., blog listing with categories, product catalog with filters, user dashboard]

Data requirements:
- Identity data: [What makes each resource unique? slug, id, username?]
- Filter options: [What can users filter by? category, tags, status?]
- Sort options: [What sort orders do you support?]
- Pagination: [Do you need page/cursor pagination?]
- View preferences: [Any view toggles like grid/list, compact/detailed?]
</specific-scenario>

<questions>
1. **Route structure:** What should the file path be? (e.g., app/blog/[slug]/page.tsx vs app/blog/page.tsx)
2. **params vs searchParams:** Which data belongs in the URL path (params) vs query string (searchParams)?
3. **Shareability:** Should a filtered URL be bookmarkable and preserve all filters?
4. **Filter interaction:** When a user changes filters, should pagination reset to page 1?
5. **Default values:** What happens when searchParams are empty? Show all or apply defaults?
6. **Validation:** How do I validate searchParams and handle invalid values gracefully?
7. **TypeScript types:** How do I type params and searchParams properly as Promises?
8. **Async pattern:** How do I await params and searchParams correctly in my page component?
</questions>

<example-urls>
Desired URL examples:
1. [Show example URL for base case]
2. [Show example URL with filters applied]
3. [Show example URL with detail page]
4. [Show example URL with all options]
</example-urls>

Recommend a URL structure with file paths, explain params vs searchParams separation, provide Zod validation schema for searchParams, and show code examples for reading and updating URL state. Explain how to preserve existing searchParams when updating filters.
```

This will help you design clean, shareable, and type-safe URL structures.

## Hands-On Exercise 2.7

Build URL-driven state with proper separation of concerns.

**Requirements:**

1. Implement a listing page driven by `searchParams` (filters, sorting, pagination).
2. Keep detail page identity in `params` (e.g., blog post slug).
3. Demonstrate both in blog routes.
4. Show how to update search params without losing existing filters.

**Implementation hints:**

- **params and searchParams are Promises:** Both must be awaited before use. Page components must be async.
- **TypeScript types:** Type params as `Promise<{ slug: string }>` and searchParams as `Promise<{ category?: string }>`, etc.
- **Parallel awaiting:** When you need both params and searchParams, use `Promise.all([params, searchParams])` for optimal performance.
- **params for route segments:** Dynamic segments like `[slug]` become params, used for resource identity (e.g., blog post, product ID).
- **searchParams for query strings:** Everything after `?` in URL, used for filters, search queries, pagination, view preferences.
- **URL state preservation:** Makes filtered results bookmarkable and shareable.
- **Filter patterns:** Use `searchParams` for category, sort, page, query filters.
- **Reset pagination:** When filters change, reset `page` to 1 to avoid empty results.
- **Server Components:** params and searchParams passed as props automatically, perfect for initial data fetching (remember to await).
- **Client Components:** Use `useSearchParams` to read, `useRouter` to update dynamically.

\*\*Warning: Suspense Required for useSearchParams\*\*

When using `useSearchParams` in a statically rendered route, wrap the component in a `<Suspense>` boundary. Without this, Next.js will client-render the entire page to avoid hydration errors. The component that calls `useSearchParams` should be wrapped in Suspense with a fallback.

- Avoid encoding identity in query strings.
- Keep URLs meaningful and shareable.
- Preserve existing search params when updating (use `URLSearchParams`).

\*\*Note: Bookmarkable URLs\*\*

Search parameters make your app more shareable. Users can bookmark filtered results and return to the exact same view. The browser back button respects filter changes.

\*\*Note: When to Use Each\*\*

Use params for identity (required segments like /blog/\[slug]). Use searchParams for optional state (filters, sort, page). This separation keeps URLs robust and UX solid.

## Caching Impact

\*\*Warning: searchParams Forces Dynamic Rendering\*\*

Using `searchParams` makes your route dynamic (shown as ƒ in build output, meaning the route renders per-request rather than being prerendered). The route cannot be prerendered because query strings vary per request. If you need caching, put identity data in `params` and use `generateStaticParams` to prerender known values.

**Key insight:** `params` enable caching, `searchParams` prevent it.

```
┌─────────────────────────────────────────┐
│      PARAMS vs SEARCHPARAMS CACHING     │
├─────────────────────────────────────────┤
│ params (path segments)                  │
│ └─ Static by default (○)                │
│ └─ Can prerender with generateStaticParams │
│                                         │
│ searchParams (query string)             │
│ └─ Always dynamic (ƒ)                   │
│ └─ Cannot be prerendered                │
└─────────────────────────────────────────┘
```

| URL Part                  | Build Output | Caching Behavior        | Use For             |
| ------------------------- | ------------ | ----------------------- | ------------------- |
| `params` (`[slug]`)       | ○ (Static)   | Can prerender per value | Resource identity   |
| `searchParams` (`?sort=`) | ƒ (Dynamic)  | Renders per request     | Filters, pagination |

### Cache by Params Strategy

When you need both caching and filtering, cache the expensive data by `params` and keep `searchParams` for lightweight filtering:

```typescript title="apps/blog/src/app/[slug]/page.tsx"
// cacheTag and cacheLife are Next.js 16 cache APIs - you'll learn these in Lesson 3.1
import { cacheTag, cacheLife } from 'next/cache'

// Cached data function - keyed by slug (params)
async function getPost(slug: string) {
  "use cache"
  cacheTag(`post-${slug}`)
  cacheLife('hours')
  
  // Expensive database query - cached per slug
  return db.posts.findUnique({ where: { slug } })
}

export default async function BlogPost({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ highlight?: string }>
}) {
  const [{ slug }, { highlight }] = await Promise.all([params, searchParams])
  
  // Post data is cached (keyed by slug)
  const post = await getPost(slug)
  
  // Highlighting is dynamic (depends on searchParams)
  // but doesn't require a database query
  return (
    <article>
      <h1>{post.title}</h1>
      <Content text={post.content} highlight={highlight} />
    </article>
  )
}

// Prerender known slugs at build time
export async function generateStaticParams() {
  const posts = await db.posts.findMany({ select: { slug: true } })
  return posts.map((post) => ({ slug: post.slug }))
}
```

**The pattern:**

1. **Identity data** (product ID, post slug) → `params` → cacheable with `generateStaticParams`
2. **State data** (filters, sort, page, highlight) → `searchParams` → dynamic but lightweight
3. **Expensive operations** → Cache by `params`, not affected by `searchParams`

This separation lets you cache the expensive parts (database queries) while keeping filters dynamic.

## Code Examples

### Dynamic Route with params

```typescript title="apps/blog/src/app/[slug]/page.tsx"
export default async function BlogPost({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  // Await params before accessing values
  const { slug } = await params

  // Fetch data using the slug
  const post = await getPost(slug)

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

### Listing Page with searchParams

```typescript title="apps/blog/src/app/page.tsx"
export default async function BlogListing({
  searchParams
}: {
  searchParams: Promise<{
    category?: string
    page?: string
    sort?: string
  }>
}) {
  // Await searchParams before accessing values
  const { category, page, sort } = await searchParams

  // Use searchParams for filtering and pagination
  const posts = await getPosts({
    category,
    page: parseInt(page || '1'),
    sort: sort || 'recent'
  })

  return (
    <div>
      <h1>Blog Posts {category && `in ${category}`}</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </div>
  )
}
```

### Combined params + searchParams (Parallel Await)

```typescript title="apps/blog/src/app/[slug]/comments/page.tsx"
export default async function CommentsPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; filter?: string }>
}) {
  // Parallel await for optimal performance
  const [{ slug }, { sort, filter }] = await Promise.all([
    params,
    searchParams
  ])

  // Both values are now available
  const comments = await getComments(slug, {
    sort: sort || 'recent',
    filter
  })

  return (
    <div>
      <h1>Comments for {slug}</h1>
      {comments.map(comment => (
        <div key={comment.id}>{comment.text}</div>
      ))}
    </div>
  )
}
```

### TypeScript Types Pattern

```typescript
// Extract types for reuse
type BlogPostParams = Promise<{ slug: string }>
type BlogSearchParams = Promise<{
  category?: string
  page?: string
  sort?: 'recent' | 'popular' | 'oldest'
}>

export default async function Page({
  params,
  searchParams
}: {
  params: BlogPostParams
  searchParams: BlogSearchParams
}) {
  const { slug } = await params
  const { category, page, sort } = await searchParams
  // ...
}
```

\*\*Note: Performance: Parallel Awaiting\*\*

When you need both params and searchParams, use `Promise.all()` to await them in parallel instead of sequentially. This reduces latency by running both Promise resolutions concurrently.

## Try It

- Share a filtered URL and confirm state is preserved.

## Commit & Deploy

```bash
git add -A
git commit -m "feat(core): implement params identity + searchParams filters"
git push -u origin feat/core-params-searchparams
```

## Done-When

- [ ] Navigate to `/hello-world` in blog app: blog post content displays (params for identity)
- [ ] Navigate to blog listing, click "Tech" filter: URL updates to `?category=tech` and list filters
- [ ] Copy the filtered URL, open in new tab: same filtered results appear (bookmarkable state)
- [ ] Change sort dropdown: URL updates to include `?sort=title`, existing `category` param preserved
- [ ] Click "Clear filters": URL returns to base path with no query string
- [ ] Code review: params and searchParams both typed as `Promise<...>` and awaited

\*\*Side Quest: Validate & Canonicalize URLs\*\*

## Solution

Solution

### Install Dependencies

No additional dependencies needed for basic params/searchParams. For URL validation, consider:

```bash
pnpm add zod
```

### Blog Post Detail Page (params)

```typescript title="apps/blog/src/app/[slug]/page.tsx"
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ slug: string }>
}

// Mock data fetcher
async function getPost(slug: string) {
  const posts: Record<string, { title: string; content: string }> = {
    'hello-world': { title: 'Hello World', content: 'Welcome to our blog!' },
    'nextjs-routing': { title: 'Next.js Routing', content: 'Learn about App Router.' },
  }
  return posts[slug] || null
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-3xl font-bold">{post.title}</h1>
      <p className="text-gray-600">{post.content}</p>
    </article>
  )
}
```

### Blog Listing Page (searchParams)

```typescript title="apps/blog/src/app/page.tsx"
import Link from 'next/link'
import { FilterControls } from './filter-controls'

type Props = {
  searchParams: Promise<{
    category?: string
    sort?: string
    page?: string
  }>
}

// Mock data
const allPosts = [
  { id: '1', slug: 'hello-world', title: 'Hello World', category: 'general' },
  { id: '2', slug: 'nextjs-routing', title: 'Next.js Routing', category: 'tech' },
  { id: '3', slug: 'react-tips', title: 'React Tips', category: 'tech' },
]

export default async function BlogListingPage({ searchParams }: Props) {
  const { category, sort, page } = await searchParams

  // Filter and sort posts
  let posts = category
    ? allPosts.filter((p) => p.category === category)
    : allPosts

  if (sort === 'title') {
    posts = [...posts].sort((a, b) => a.title.localeCompare(b.title))
  }

  const currentPage = parseInt(page || '1', 10)

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">
        Blog Posts {category && <span className="text-gray-500">in {category}</span>}
      </h1>

      {/* Client Component for filter controls */}
      <FilterControls currentCategory={category} currentSort={sort} />

      <ul className="mt-6 space-y-4">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/${post.slug}`}
              className="block rounded-lg border p-4 hover:bg-gray-50"
            >
              <h2 className="font-semibold">{post.title}</h2>
              <span className="text-sm text-gray-500">{post.category}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-gray-500">Page {currentPage}</p>
    </div>
  )
}
```

### Client-Side Filter Controls (useSearchParams + useRouter)

```typescript title="apps/blog/src/app/filter-controls.tsx"
'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

type Props = {
  currentCategory?: string
  currentSort?: string
}

export function FilterControls({ currentCategory, currentSort }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Create a new URLSearchParams instance preserving existing params
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset pagination when filters change
      if (name !== 'page') {
        params.delete('page')
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleCategoryChange = (category: string) => {
    router.push(`${pathname}?${createQueryString('category', category)}`)
  }

  const handleSortChange = (sort: string) => {
    router.push(`${pathname}?${createQueryString('sort', sort)}`)
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  return (
    <div className="flex flex-wrap gap-4">
      {/* Category filter */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleCategoryChange('')}
          className={`rounded px-3 py-1 text-sm ${
            !currentCategory ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => handleCategoryChange('tech')}
          className={`rounded px-3 py-1 text-sm ${
            currentCategory === 'tech' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
        >
          Tech
        </button>
        <button
          type="button"
          onClick={() => handleCategoryChange('general')}
          className={`rounded px-3 py-1 text-sm ${
            currentCategory === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
        >
          General
        </button>
      </div>

      {/* Sort control */}
      <select
        value={currentSort || ''}
        onChange={(e) => handleSortChange(e.target.value)}
        className="rounded border px-3 py-1 text-sm"
      >
        <option value="">Default order</option>
        <option value="title">Sort by title</option>
      </select>

      {/* Clear all filters */}
      {(currentCategory || currentSort) && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-red-600 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
```

\*\*Warning: Suspense Required for useSearchParams\*\*

When using `useSearchParams` in a statically rendered route, wrap the component in a `<Suspense>` boundary to prevent client-side rendering of the entire page:

```typescript title="apps/blog/src/app/page.tsx"
import { Suspense } from 'react'
import { FilterControls } from './filter-controls'

// In your page component:
<Suspense fallback={<div className="h-10 animate-pulse bg-gray-100" />}>
  <FilterControls currentCategory={category} currentSort={sort} />
</Suspense>
```

### Key Patterns

1. **params for identity:** Dynamic route segments (`[slug]`) become params. Always await before use.

2. **searchParams for state:** Query string values for filters, sort, pagination. Also awaited in Server Components.

3. **useSearchParams for client updates:** Read current params, create new URLSearchParams, preserve existing values.

4. **Reset pagination on filter change:** Delete `page` param when changing other filters to avoid empty results.

5. **Shareable URLs:** Users can bookmark `/blog?category=tech&sort=title` and share the exact filtered view.

## References

- <https://nextjs.org/docs/app/api-reference/file-conventions/page#params-optional>
- <https://nextjs.org/docs/app/api-reference/functions/use-search-params>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
