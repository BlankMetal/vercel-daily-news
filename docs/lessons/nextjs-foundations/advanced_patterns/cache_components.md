---
title: "Cache Components for Instant and Fresh Pages"
description: "Use Cache Components to prerender static shells instantly while serving fresh or cached dynamic data. Control revalidation with cacheLife() for time-based updates or cacheTag() for on-demand invalidation."
canonical_url: "https://vercel.com/academy/nextjs-foundations/cache-components"
md_url: "https://vercel.com/academy/nextjs-foundations/cache-components.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-15T12:45:37.701Z"
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

# Cache Components for Instant and Fresh Pages

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Cache Components for Instant and Fresh Pages

Your product page loads instantly but shows yesterday's prices. Your dashboard is always fresh but takes 3 seconds to load. The old mental model said "pick SSG or SSR." The new model: everything prerenders a static shell, you decide what else to cache.

\*\*Note: Quick Primer: What is Suspense?\*\*

This lesson uses React's `<Suspense>` component. If you haven't seen it before, here's what you need to know:

**Suspense** is a React feature that lets you show a fallback UI while waiting for async content to load:

```tsx
import { Suspense } from 'react'

<Suspense fallback={<Loading />}>
  <SlowComponent />  {/* Shows Loading while this resolves */}
</Suspense>
```

- **Purpose:** Show something immediately instead of a blank screen
- **How it works:** When a component inside Suspense "suspends" (awaits data), React shows the fallback
- **In Next.js:** Server Components that await data automatically suspend

You'll use Suspense throughout this lesson to create "dynamic holes" in static shells. We'll cover Suspense patterns in depth in [Lesson 3.3: Suspense and Streaming](/03-advanced-patterns/suspense-and-streaming).

\*\*Warning: Before You Enable cacheComponents\*\*

Enabling `cacheComponents: true` in `next.config.ts` changes how Next.js handles prerendering. Code that uses `Date.now()`, `new Date()`, or `performance.now()` in Server Components will fail with prerender errors because these return different values at build time vs request time.

**Recommended solutions (in order of preference):**

1. **Wrap in Suspense + "use cache"** (best for most cases):

```tsx
import { Suspense } from 'react'
import { cacheLife } from 'next/cache'

async function Timestamp() {
  "use cache"
  cacheLife('seconds') // Refresh every 30 seconds
  return <p>Generated at {Date.now()}</p>
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Timestamp />
    </Suspense>
  )
}
```

2. **Move to client component** (for real-time updates):

```tsx
"use client"
import { useState, useEffect } from 'react'

export function LiveTimestamp() {
  const [time, setTime] = useState<number | null>(null)
  
  useEffect(() => {
    setTime(Date.now())
    const interval = setInterval(() => setTime(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])
  
  return <p>Current time: {time}</p>
}
```

3. **Use `connection()`** (only for entire-page-dynamic scenarios):

```tsx
import { connection } from 'next/server'

// Use ONLY when the entire page must be dynamic
// (e.g., CSP nonces, all content is user-specific)
export default async function Page() {
  await connection() // Opts entire route into dynamic rendering
  return <p>Generated at {Date.now()}</p>
}
```

See the [Troubleshooting](#troubleshooting) section for detailed examples.

\*\*Note: connection() is Often an Anti-Pattern\*\*

Using `connection()` opts the **entire route** into dynamic rendering, losing all caching benefits. Only use it when:

- The entire page must be dynamic (CSP nonces, all user-specific content)
- Nothing on the page is cacheable

For partial dynamic content, use Suspense + "use cache" instead. See the [connection() Decision Tree](#when-to-use-connection) below.

## Outcome

A product page with cached data that revalidates on inventory updates, using "use cache", cacheLife(), and cacheTag().

## Fast Track

1. Add "use cache" to expensive data functions (caches the return value, not execution)
2. Configure cacheLife() profile for time-based revalidation (e.g., stale 5min, revalidate 15min)
3. Add cacheTag() + revalidateTag(tag, 'max') for on-demand invalidation after mutations

## Default Prerendering: Everything Gets a Static Shell

Next.js 16 prerenders **everything by default**. This means your routes generate static HTML and an RSC payload (React Server Components payload, the serialized component tree sent from server to client) before any user requests them. The static shell includes:

- Page layout and UI structure
- Non-dynamic content (text, images, static imports)
- Everything outside Suspense boundaries

**Dynamic APIs automatically opt out:**

```typescript
import { cookies, headers } from 'next/headers'

// This page becomes dynamic (no prerendering) because it uses cookies()
export default async function UserDashboard() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  
  // User-specific data, always fresh
  const user = await fetchUser(userId)
  
  return <h1>Welcome, {user.name}!</h1>
}
```

Using `cookies()`, `headers()`, `searchParams`, or `unstable_noStore()` tells Next.js: "This content is user-specific or request-specific, don't prerender it."

**Suspense boundaries create "dynamic holes":**

```typescript
export default function ProductPage() {
  return (
    <div>
      {/* Static shell - prerenders */}
      <Header />
      <ProductLayout>
        
        {/* Dynamic hole - streams at runtime */}
        <Suspense fallback={<Skeleton />}>
          <ProductDetails />
        </Suspense>
        
      </ProductLayout>
      <Footer />
    </div>
  )
}
```

The static shell loads instantly. Dynamic content inside Suspense boundaries streams when ready. This is **PPR (Partial Prerendering)**, a rendering strategy that combines static and dynamic content in a single route.

## "use cache" Directive: Cache Expensive Data

The `"use cache"` directive caches the **return value** of async functions, components, or entire files. It does NOT cache execution, it caches the result.

**File-level caching:**

```typescript title="apps/web/src/lib/products.ts"
"use cache"

// All exports in this file are cached
export async function getProducts() {
  const res = await fetch('https://api.acme.com/products')
  return res.json()
}

export async function getProductById(id: string) {
  const res = await fetch(`https://api.acme.com/products/${id}`)
  return res.json()
}
```

**Function-level caching:**

```typescript title="apps/web/src/app/products/[id]/page.tsx"
import { cacheLife } from 'next/cache'

async function getProduct(id: string) {
  "use cache"
  cacheLife('products') // Use "products" profile from next.config.js
  
  const res = await fetch(`https://api.acme.com/products/${id}`)
  return res.json()
}

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const product = await getProduct(id)
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>Price: ${product.price}</p>
      <p>Stock: {product.inventory}</p>
    </div>
  )
}
```

**Component-level caching:**

```typescript
async function ProductGrid({ category }: { category: string }) {
  "use cache"
  cacheLife('products')
  
  const products = await fetchProductsByCategory(category)
  
  return (
    <div className="grid">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
```

\*\*Warning: Cannot Use Dynamic APIs Inside 'use cache'\*\*

You **cannot** call `cookies()`, `headers()`, `searchParams`, or other dynamic APIs inside a cached scope. Extract them outside and pass as props:

```typescript
// ❌ BAD - dynamic API inside cache
async function getUserData() {
  "use cache"
  const cookieStore = await cookies() // ERROR!
  return fetchUser(cookieStore.get('userId'))
}

// ✅ GOOD - extract outside, pass as prop
async function getUserData(userId: string) {
  "use cache"
  return fetchUser(userId)
}

export default async function Page() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const user = await getUserData(userId!) // Pass as argument
  
  return <h1>{user.name}</h1>
}
```

## cacheLife(): Time-Based Revalidation

Define **cache profiles** in `next.config.js` to control how long cached data stays fresh and when it revalidates:

```typescript title="apps/web/next.config.ts"
import type { NextConfig } from 'next'

const config: NextConfig = {
  cacheComponents: true, // Enable Cache Components (top-level in 16.1.x+)
  cacheLife: {
    // Blog posts - longer cache, updates are rare
    blog: {
      stale: 3600, // 1 hour fresh
      revalidate: 86400, // 24 hours before revalidation
      expire: 604800, // 1 week max before forced regeneration
    },
    // Product catalog - moderate cache
    products: {
      stale: 300, // 5 minutes fresh
      revalidate: 900, // 15 minutes before revalidation
      expire: 3600, // 1 hour max
    },
    // Real-time data - minimal cache
    social: {
      stale: 60, // 1 minute fresh
      revalidate: 300, // 5 minutes before revalidation
      expire: 600, // 10 minutes max
    },
  },
}

export default config
```

**Profile semantics:**

- `stale`: Data is fresh for this duration (served from cache, no revalidation)
- `revalidate`: After this period, revalidate in the background using stale-while-revalidate (serve cached content while fetching fresh data in the background)
- `expire`: Maximum time before forced synchronous regeneration

**Use profiles in functions:**

```typescript
import { cacheLife } from 'next/cache'

async function getBlogPost(slug: string) {
  "use cache"
  cacheLife('blog') // Use blog profile
  
  const post = await fetchBlogPost(slug)
  return post
}

async function getProducts() {
  "use cache"
  cacheLife('products') // Use products profile
  
  const products = await fetchProducts()
  return products
}
```

## cacheTag() + revalidateTag(): On-Demand Invalidation

Tag cache entries to invalidate them after mutations (create, update, delete):

```typescript title="apps/web/src/lib/products.ts"
import { cacheLife, cacheTag } from 'next/cache'

async function getProduct(id: string) {
  "use cache"
  cacheLife('products')
  cacheTag('products', `product-${id}`) // Tag this cache entry
  
  const res = await fetch(`https://api.acme.com/products/${id}`)
  return res.json()
}
```

**Invalidate after mutations:**

```typescript title="apps/web/src/app/actions/products.ts"
"use server"

import { revalidateTag } from 'next/cache'

export async function updateProduct(id: string, data: ProductData) {
  // Update in database
  await db.products.update({ where: { id }, data })
  
  // Invalidate cached product data (Next.js 16.1.x requires second argument)
  revalidateTag(`product-${id}`, 'max') // Invalidate specific product
  revalidateTag('products', 'max') // Invalidate product list
  
  return { success: true }
}

export async function createProduct(data: ProductData) {
  await db.products.create({ data })
  
  // Only invalidate list, no specific product to invalidate
  revalidateTag('products', 'max')
  
  return { success: true }
}
```

**Call from client components:**

```typescript title="apps/web/src/components/product-form.tsx"
"use client"

import { updateProduct } from '@/app/actions/products'

export function ProductForm({ product }: { product: Product }) {
  async function handleSubmit(formData: FormData) {
    const result = await updateProduct(product.id, {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
    })
    
    // Cache invalidated automatically via revalidateTag() in action
    if (result.success) {
      alert('Product updated!')
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input name="name" defaultValue={product.name} />
      <input name="price" type="number" defaultValue={product.price} />
      <button type="submit">Save</button>
    </form>
  )
}
```

## PPR: Place Suspense Close to Dynamic Content

**PPR (Partial Prerendering)** maximizes the static shell by placing Suspense boundaries **close to dynamic content**:

```typescript title="apps/web/src/app/products/[id]/page.tsx"
import { Suspense } from 'react'
import { cacheLife, cacheTag } from 'next/cache'

async function ProductDetails({ id }: { id: string }) {
  "use cache"
  cacheLife('products')
  cacheTag('products', `product-${id}`)
  
  const product = await fetchProduct(id)
  return (
    <div>
      <h2>{product.name}</h2>
      <p>${product.price}</p>
    </div>
  )
}

async function ProductReviews({ id }: { id: string }) {
  // No cache - always fetch fresh reviews
  const reviews = await fetchReviews(id)
  return (
    <div>
      {reviews.map(r => (
        <div key={r.id}>{r.comment}</div>
      ))}
    </div>
  )
}

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return (
    <div>
      {/* Static shell - prerenders instantly */}
      <header>Product Page</header>
      
      {/* Cached product data - loads fast from cache */}
      <Suspense fallback={<div>Loading product...</div>}>
        <ProductDetails id={id} />
      </Suspense>
      
      {/* Fresh reviews - streams after product */}
      <Suspense fallback={<div>Loading reviews...</div>}>
        <ProductReviews id={id} />
      </Suspense>
      
      <footer>Footer content</footer>
    </div>
  )
}
```

**Result:**

1. Static shell (header, layout, footer) loads instantly
2. Cached product data loads from cache (fast)
3. Fresh reviews stream when ready (dynamic)

## Decision Framework

```
┌─────────────────────────────────────────────────────────────┐
│                    CACHE DECISION TREE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Is the data user-specific?                                 │
│  ├─ YES → Keep dynamic (no cache)                          │
│  └─ NO → Continue...                                        │
│                                                             │
│  Is staleness acceptable?                                   │
│  ├─ NO → Keep dynamic                                       │
│  └─ YES → Use "use cache"                                   │
│                                                             │
│  How should it revalidate?                                  │
│  ├─ On schedule → cacheLife() with time profile            │
│  └─ After mutations → cacheTag() + revalidateTag()         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Examples:**

| Data Type          | User-Specific? | Staleness OK?          | Strategy                                   |
| ------------------ | -------------- | ---------------------- | ------------------------------------------ |
| User dashboard     | Yes            | N/A                    | Dynamic (no cache)                         |
| Product catalog    | No             | Yes (5-15min)          | "use cache" + cacheLife('products')        |
| Blog posts         | No             | Yes (1-24hr)           | "use cache" + cacheLife('blog')            |
| Live sports scores | No             | No                     | Dynamic (no cache)                         |
| Product detail     | No             | Yes, with invalidation | "use cache" + cacheTag() + revalidateTag() |

````markdown title="Prompt: Design Caching Strategy for My Data"
I'm implementing Cache Components in Next.js 16 and need help deciding on a caching strategy.

<context>
Next.js 16 Cache Components offer:
- `"use cache"` directive for shared caching
- `"use cache: private"` for per-user caching
- `cacheLife()` for time-based expiration (profiles: blog, products, social, etc.)
- `cacheTag()` + `revalidateTag()` for mutation-based invalidation
</context>

<my-data>
**Data type:** _____
Example: "Product catalog", "User dashboard", "Blog posts", "Live sports scores"

**How often it changes:** _____
Example: "Every few hours", "When admin updates", "Real-time", "Once a day"

**Is it user-specific?**
- [ ] Same for all users (shared)
- [ ] Different per user (personalized)

**Staleness tolerance:** _____
Example: "5 minutes is fine", "Must be real-time", "1 hour acceptable"

**What triggers updates:** _____
Example: "Admin publishes", "User makes purchase", "External API webhook"
</my-data>

<current-implementation>
```tsx
// My current data fetching:
___PASTE_YOUR_DATA_FETCHING_CODE___
```
</current-implementation>

**Questions:**
1. Should I cache this data at all?
2. Which cacheLife profile fits? (blog, products, social, or custom)
3. Should I use time-based (cacheLife) or mutation-based (cacheTag) invalidation?
4. Shared cache or per-user cache?

Generate a complete caching implementation with the appropriate directives and invalidation strategy. Explain why each choice fits my data.
````

## Edge Cases and Gotchas

Understanding these edge cases prevents debugging headaches:

### Edge Runtime Not Supported

`"use cache"` requires the Node.js runtime. It does **NOT** work with Edge Runtime:

```typescript
// ❌ FAILS - Edge Runtime doesn't support "use cache"
export const runtime = 'edge'

async function getData() {
  "use cache"  // Error: "use cache" is not supported in Edge Runtime
  return fetch('https://api.example.com/data')
}
```

If you need Edge Runtime for latency reasons, use `fetch()` with `cache` and `next.revalidate` options instead of `"use cache"`.

### Serialization Required

All arguments and return values must be serializable (convertible to JSON format, meaning only primitive values, arrays, and plain objects):

```typescript
// ❌ FAILS - Functions aren't serializable
async function getData(callback: () => void) {
  "use cache"
  callback() // Error: callback is not serializable
  return fetch('/api/data')
}

// ❌ FAILS - Symbols aren't serializable
async function getData(config: { [Symbol.for('key')]: string }) {
  "use cache"
  return fetch('/api/data')
}

// ✅ WORKS - Primitive arguments and plain objects
async function getData(id: string, options: { limit: number }) {
  "use cache"
  return fetch(`/api/data/${id}?limit=${options.limit}`)
}
```

### Nested Caching Behavior

When cached functions call other cached functions, the **innermost** `cacheLife()` wins unless the outer function also specifies one:

```typescript
// Outer cache without cacheLife → inner controls timing
async function outer() {
  "use cache"
  return inner()  // inner's cacheLife wins
}

async function inner() {
  "use cache"
  cacheLife('hours')  // This controls the cache timing
  return fetch('/api/data')
}

// Outer cache WITH cacheLife → outer wins
async function outerWithLife() {
  "use cache"
  cacheLife('minutes')  // This overrides inner
  return inner()
}
```

### map() Pitfall: Async Callbacks Don't Work

You cannot use `"use cache"` inside array callbacks like `map()`:

```typescript
// ❌ FAILS - "use cache" inside map callback
const results = items.map(async (item) => {
  "use cache"  // Error: Directive must be at function body start
  return processItem(item)
})

// ✅ WORKS - Extract to named function
async function processItem(id: string) {
  "use cache"
  cacheTag(`item-${id}`)
  return fetch(`/api/items/${id}`)
}

const results = await Promise.all(
  items.map((item) => processItem(item.id))
)
```

### All "use cache" Functions Must Be Async

The `"use cache"` directive only works with async functions:

```typescript
// ❌ FAILS - Synchronous function
function getConfig() {
  "use cache"  // Error: "use cache" functions must be async
  return { theme: 'dark' }
}

// ✅ WORKS - Async function
async function getConfig() {
  "use cache"
  return { theme: 'dark' }
}
```

### cacheTag Limits

Tags have size and count limits:

- **Maximum tag length:** 256 characters
- **Maximum tags per entry:** 128 tags

```typescript
// ❌ FAILS - Tag too long
cacheTag('a'.repeat(300))  // Error: Tag exceeds 256 characters

// ❌ FAILS - Too many tags
cacheTag(...Array(200).fill('tag'))  // Error: Exceeds 128 tags

// ✅ WORKS - Use hierarchical tags
cacheTag('products', `product-${id}`, `category-${categoryId}`)
```

## When to Use connection()

```
┌─────────────────────────────────────────────────────────────┐
│               connection() DECISION TREE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Does the ENTIRE page need to be dynamic?                   │
│  ├─ NO → Use Suspense + "use cache" for partial caching    │
│  └─ YES → Continue...                                       │
│                                                             │
│  Is there ANY cacheable content on the page?                │
│  ├─ YES → Use Suspense to isolate dynamic parts            │
│  └─ NO → Continue...                                        │
│                                                             │
│  Why is the entire page dynamic?                            │
│  ├─ CSP nonces → connection() ✓                            │
│  ├─ All user-specific → connection() ✓                     │
│  ├─ Realtime updates → Client Component ✓                  │
│  └─ "It's easier" → Suspense + "use cache" ✓               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Valid uses of connection():**

- CSP nonces that must be unique per request
- Pages where 100% of content is user-specific
- Webhook handlers that must process every request

**Anti-pattern uses of connection():**

- "Quick fix" for Date.now() errors
- Pages with any cacheable content
- Avoiding Suspense boundaries

## Cache Variants

Next.js 16 supports three cache variants for different use cases:

| Variant                | Scope                   | Use Case                                |
| ---------------------- | ----------------------- | --------------------------------------- |
| `"use cache"`          | Shared across all users | Public data (products, blog posts)      |
| `"use cache: private"` | Per-user cache          | User-specific but cacheable (dashboard) |
| `"use cache: remote"`  | Remote cache (Vercel)   | Distributed caching across regions      |

```typescript title="apps/web/src/lib/data.ts"
// Public data - shared cache (default)
async function getProducts() {
  "use cache"
  return fetch('/api/products')
}

// User-specific but cacheable
async function getUserDashboard(userId: string) {
  "use cache: private"
  cacheTag(`user-${userId}`)
  return fetch(`/api/users/${userId}/dashboard`)
}

// Distributed cache (Vercel infrastructure)
async function getGlobalConfig() {
  "use cache: remote"
  return fetch('/api/config')
}
```

\*\*Warning: 'use cache: private' Known Bug\*\*

Currently, `'use cache: private'` has a bug where client navigation causes cache misses ([#85672](https://github.com/vercel/next.js/issues/85672)). As a workaround, use `'use cache'` with user-specific cache tags:

```typescript
// Workaround for private cache bug
async function getUserDashboard(userId: string) {
  "use cache"
  cacheTag(`user-dashboard-${userId}`)  // User-specific tag
  return fetch(`/api/users/${userId}/dashboard`)
}
```

## Known Bugs (Next.js 16.1.x)

\*\*Note: Known Issues to Watch\*\*

These bugs may affect your caching implementation. Check the linked issues for updates:

1. **`'use cache: private'` + client navigation = cache miss** ([#85672](https://github.com/vercel/next.js/issues/85672))
   - **Workaround:** Use `'use cache'` with user-specific tags instead

2. **Dynamic routes + Vercel production = cache sometimes ignored** ([#85240](https://github.com/vercel/next.js/issues/85240))
   - **Workaround:** Add explicit `cacheTag()` to affected routes

3. **`updateTag` can affect unrelated tags** ([#85739](https://github.com/vercel/next.js/issues/85739))
   - **Workaround:** Use unique tag prefixes per resource type (e.g., `product-123`, `user-456`)

4. **Custom cache handlers don't work in production** ([#72552](https://github.com/vercel/next.js/issues/72552))
   - **Workaround:** Use the default cache handler

5. **Draft Mode + `cookies()` inside `'use cache'` throws** ([#87742](https://github.com/vercel/next.js/issues/87742))
   - **Workaround:** Extract `cookies()` outside the cache scope and pass values as arguments

## Hands-On Exercise 3.1

**Requirements:**

1. Add "use cache" to a product data function in `apps/web/src/lib/products.ts`
2. Configure a `products` cacheLife profile in `next.config.ts` (stale: 5min, revalidate: 15min, expire: 1hr)
3. Add `cacheTag()` to tag product cache entries with `product-${id}` and `products`
4. Create a Server Action in `apps/web/src/app/actions/products.ts` that updates a product and calls `revalidateTag()`
5. Test cache behavior in the browser Network tab (check cache headers)

**Implementation hints:**

- Use `cacheLife('products')` inside the cached function, after the "use cache" directive
- `cacheTag()` accepts multiple tags: `cacheTag('products', 'product-123')`
- Server Actions must have `"use server"` at the top
- Call `revalidateTag(tag, 'max')` after database mutations to invalidate specific cache entries
- Verify with `curl -I http://localhost:3000/products/123` to see cache headers

## Try It

1. **Verify static shell prerendering:**
   - Run `pnpm build` and check build output
   - Look for `○` (static) vs `ƒ` (dynamic) indicators
   - Static routes show prerendered HTML size

2. **Test cache behavior:**
   - Load product page: `http://localhost:3000/products/123`
   - Open Network tab, check response headers for cache status
   - Reload page, verify cached response (should be instant)

3. **Test cache invalidation:**
   - Trigger `revalidateTag('product-123', 'max')` via Server Action
   - Reload product page, verify fresh data appears
   - Check Network tab for cache miss followed by new cache entry

4. **Measure performance:**
   - Use Lighthouse to measure FCP (First Contentful Paint)
   - Compare static shell (instant) vs dynamic content (streaming)

## Commit & Deploy

```bash
git add -A
git commit -m "feat(advanced): implement Cache Components with cacheLife and cacheTag"
git push -u origin feat/cache-components
```

## Done-When

- [ ] Product page loads instantly (static shell prerendered, visible in build output)
- [ ] Product data shows cached values (verify cache headers in Network tab)
- [ ] After calling `revalidateTag()`, next request shows fresh data
- [ ] Build output shows static routes with appropriate cache configuration

## Troubleshooting

**"Cannot use cookies() inside 'use cache'"**

- Extract `cookies()`, `headers()`, or `searchParams` outside the cached function
- Pass values as function arguments instead

```typescript
// ❌ BAD
async function getData() {
  "use cache"
  const cookieStore = await cookies() // ERROR
  return fetchData(cookieStore.get('token'))
}

// ✅ GOOD
async function getData(token: string) {
  "use cache"
  return fetchData(token)
}

// In page component
const cookieStore = await cookies()
const data = await getData(cookieStore.get('token')?.value!)
```

**"revalidateTag() requires 2 arguments" or "Expected 2 arguments, but got 1"**

In Next.js 16.1.x, `revalidateTag()` requires a second argument specifying the revalidation scope:

```typescript
// ❌ Old API (breaks in 16.1.x)
revalidateTag('products')

// ✅ New API - use 'max' for stale-while-revalidate semantics
revalidateTag('products', 'max')

// ✅ Alternative - immediate expiration
revalidateTag('products', { expire: 0 })
```

The second argument controls how aggressively the cache is invalidated:

- `'max'`: Marks cache as stale, serves stale content while revalidating in background
- `{ expire: 0 }`: Immediately expires the cache, next request waits for fresh data

**"Error: Route /path used Date.now() which is dynamic"**

Using `Date.now()` or `new Date()` in Server Components causes prerender errors because timestamps are inherently dynamic:

```typescript
// ❌ Causes prerender error
export default async function Page() {
  const timestamp = Date.now() // ERROR during build
  return <p>Generated at {timestamp}</p>
}
```

**Solutions:**

1. **Wrap in "use cache"** (caches the timestamp at cache creation time):

```typescript
async function getTimestamp() {
  "use cache"
  return Date.now() // Cached when cache entry is created
}
```

2. **Use `connection()` to opt into dynamic rendering:**

```typescript
import { connection } from 'next/server'

export default async function Page() {
  await connection() // Opts into dynamic rendering
  const timestamp = Date.now() // Now allowed
  return <p>Generated at {timestamp}</p>
}
```

3. **Move to client component** (if you need real-time updates):

```typescript
"use client"
import { useState, useEffect } from 'react'

export function LiveTimestamp() {
  const [time, setTime] = useState<number | null>(null)
  
  useEffect(() => {
    setTime(Date.now())
  }, [])
  
  return <p>Current time: {time}</p>
}
```

**"cacheComponents is not a valid experimental option"**

In Next.js 16.1.x, `cacheComponents` moved from experimental to top-level config:

```typescript title="apps/web/next.config.ts"
// ❌ Old config (Next.js 16.0.x)
const config: NextConfig = {
  experimental: {
    cacheComponents: true, // No longer valid in 16.1.x
  },
}

// ✅ New config (Next.js 16.1.x+)
const config: NextConfig = {
  cacheComponents: true, // Top-level, not experimental
}
```

**"Data not updating after revalidateTag()"**

- Check tag spelling matches exactly (case-sensitive)
- Verify `cacheTag()` was called in the cached function
- Check Server Action has `"use server"` directive
- Ensure `revalidateTag(tag, 'max')` is called AFTER the mutation succeeds
- Verify you're using the two-argument form (see above)

**"Entire page is dynamic (no prerendering)"**

- Move Suspense boundary closer to dynamic content
- Check if you're using dynamic APIs (`cookies()`, `headers()`) at page level
- Use `export const dynamic = 'force-static'` to error if dynamic APIs are detected
- Review build output for why Next.js marked the route as dynamic

**"Cache not working in development"**

- Cache behavior differs in `dev` vs `build` mode
- Run `pnpm build && pnpm start` to test production caching
- Development mode bypasses some caching for fast refresh

\*\*Note: Still Stuck?\*\*

Ask your coding agent for help. Paste the error message and it can diagnose the issue.

\*\*Side Quest: Cache Profiling\*\*

## Solution

Click to reveal solution

```typescript title="apps/web/next.config.ts"
import type { NextConfig } from 'next'

const config: NextConfig = {
  cacheComponents: true, // Top-level in Next.js 16.1.x+
  cacheLife: {
    blog: {
      stale: 3600, // 1 hour
      revalidate: 86400, // 24 hours
      expire: 604800, // 1 week
    },
    products: {
      stale: 300, // 5 minutes
      revalidate: 900, // 15 minutes
      expire: 3600, // 1 hour
    },
    social: {
      stale: 60, // 1 minute
      revalidate: 300, // 5 minutes
      expire: 600, // 10 minutes
    },
  },
}

export default config
```

```typescript title="apps/web/src/lib/products.ts"
"use cache"

import { cacheLife, cacheTag } from 'next/cache'

/**
 * Fetch a single product by ID with caching.
 * Cache invalidated via revalidateTag() after mutations.
 */
export async function getProduct(id: string) {
  cacheLife('products') // 5min fresh, 15min revalidate, 1hr expire
  cacheTag('products', `product-${id}`) // Tag for invalidation
  
  const res = await fetch(`https://api.acme.com/products/${id}`)
  if (!res.ok) throw new Error('Failed to fetch product')
  
  return res.json() as Promise<Product>
}

/**
 * Fetch all products with caching.
 */
export async function getProducts() {
  cacheLife('products')
  cacheTag('products') // Invalidate when any product changes
  
  const res = await fetch('https://api.acme.com/products')
  if (!res.ok) throw new Error('Failed to fetch products')
  
  return res.json() as Promise<Product[]>
}

interface Product {
  id: string
  name: string
  price: number
  inventory: number
}
```

```typescript title="apps/web/src/app/products/[id]/page.tsx"
import { getProduct } from '@/lib/products'
import { Suspense } from 'react'

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return (
    <div>
      <header>
        <h1>Product Details</h1>
      </header>
      
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails id={id} />
      </Suspense>
      
      <footer>© 2024 ACME Corp</footer>
    </div>
  )
}

async function ProductDetails({ id }: { id: string }) {
  const product = await getProduct(id)
  
  return (
    <div>
      <h2>{product.name}</h2>
      <p>Price: ${product.price}</p>
      <p>In Stock: {product.inventory}</p>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
      <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
      <div className="h-6 w-24 bg-gray-200 rounded" />
    </div>
  )
}
```

```typescript title="apps/web/src/app/actions/products.ts"
"use server"

import { revalidateTag } from 'next/cache'
import { db } from '@/lib/db'

export async function updateProduct(
  id: string, 
  data: { name?: string; price?: number; inventory?: number }
) {
  try {
    // Update in database
    await db.products.update({
      where: { id },
      data,
    })
    
    // Invalidate specific product and product list (16.1.x requires second arg)
    revalidateTag(`product-${id}`, 'max')
    revalidateTag('products', 'max')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to update product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.products.delete({ where: { id } })
    
    // Only invalidate product list, specific product cache will expire naturally
    revalidateTag('products', 'max')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to delete product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}
```

```typescript title="apps/web/src/components/product-form.tsx"
"use client"

import { updateProduct } from '@/app/actions/products'
import { useState } from 'react'

export function ProductForm({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setMessage('')
    
    const result = await updateProduct(product.id, {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      inventory: Number(formData.get('inventory')),
    })
    
    setLoading(false)
    
    if (result.success) {
      setMessage('Product updated! Cache invalidated.')
    } else {
      setMessage(result.error || 'Failed to update')
    }
  }
  
  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <input 
          id="name"
          name="name" 
          defaultValue={product.name}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <div>
        <label htmlFor="price">Price</label>
        <input 
          id="price"
          name="price" 
          type="number" 
          defaultValue={product.price}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <div>
        <label htmlFor="inventory">Inventory</label>
        <input 
          id="inventory"
          name="inventory" 
          type="number" 
          defaultValue={product.inventory}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
      
      {message && (
        <p className={message.includes('success') ? 'text-green-600' : 'text-red-600'}>
          {message}
        </p>
      )}
    </form>
  )
}

interface Product {
  id: string
  name: string
  price: number
  inventory: number
}
```

\*\*Note: Cache Components vs Old Rendering Strategies\*\*

The old mental model focused on "choosing a rendering mode" per page: SSG (Static Site Generation, pages built at build time), ISR (Incremental Static Regeneration, static pages that revalidate), SSR (Server-Side Rendering, pages rendered on each request), or CSR (Client-Side Rendering, pages rendered in the browser). The new model:

- **Everything prerenders by default** (you get a static shell for free)
- **Dynamic APIs opt out** (cookies, headers, searchParams make routes dynamic)
- **"use cache" caches results** (not execution, not the entire page)
- **Revalidation is explicit** (cacheLife for time, cacheTag + revalidateTag for mutations)

This gives you fine-grained control: static shell for instant loads + cached/dynamic content where needed.

## References

- [Next.js Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)
- [use cache Directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [cacheLife API](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheLife)
- [cacheTag and revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [connection Function](https://nextjs.org/docs/app/api-reference/functions/connection) (opt into dynamic rendering)
- [Partial Prerendering (PPR)](https://nextjs.org/docs/app/getting-started/partial-prerendering)


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
