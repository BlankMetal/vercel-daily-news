---
title: "Dynamic Routing"
description: "Build a blog post page with [slug] dynamic segments, generate static paths with generateStaticParams, and gracefully handle missing content with notFound()."
canonical_url: "https://vercel.com/academy/nextjs-foundations/dynamic-routing"
md_url: "https://vercel.com/academy/nextjs-foundations/dynamic-routing.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-09T23:37:15.977Z"
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

# Dynamic Routing

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Dynamic Routing

You want to show blog posts at `/my-first-post`, `/nextjs-tips`, and `/anything-else`. Creating a separate file for each post is absurd. You need one page that handles any slug.

Dynamic routes solve this. You create `[slug]/page.tsx` and Next.js matches any path segment, passing it to your component as a parameter. This is how every content-driven site works: blogs, docs, product pages, user profiles.

The starter includes a separate `apps/blog` application running on port 3001 with dynamic routing already working. In this lesson, you'll explore how the existing route works, then enhance it with static generation.

## Outcome

Explore the existing blog dynamic route at `apps/blog/src/app/[slug]/page.tsx`, understand async params and `notFound()`, then add `generateStaticParams` to pre-render posts at build time.

## Fast Track

1. Explore the existing `apps/blog/src/app/[slug]/page.tsx` to understand async params and `notFound()`
2. Add `generateStaticParams` to the existing file to pre-render posts at build time
3. Test at `http://localhost:3001/your-post-slug` to verify dynamic routing works

\*\*Warning: Params are Async in Next.js 16\*\*

In Next.js 16, `params` and `searchParams` are Promises. You must await them before accessing values:

```tsx
export default async function Page(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  // Now you can use params.slug
}
```

This is a breaking change from earlier versions where params were synchronous.

## Building on Server and Client Components

In [Server and Client Components](/01-foundation-and-setup/server-and-client-components), you learned that Server Components can access server-only resources like environment variables and databases. Dynamic route pages are Server Components by default, which means you can:

- Fetch data directly without an API endpoint
- Access the `@repo/api` package to get blog posts
- Keep your data fetching logic on the server

\*\*Note: Switching to Blog App\*\*

We're switching to `apps/blog` (port 3001) for this lesson to explore dynamic routing in a content context. The blog app demonstrates real-world patterns like `[slug]` routes for posts, where each piece of content has its own URL path.

As you learned in [Project Setup](/01-foundation-and-setup/project-setup), the starter includes multiple apps. The blog is a separate Next.js application optimized for content delivery, while `apps/web` is your main marketing site. This separation lets you configure caching, rendering, and deployment strategies differently for each use case.

## Step 1: Explore the Existing Dynamic Route

The starter already has a working blog with dynamic routing at `apps/blog/src/app/[slug]/page.tsx`. Let's understand how it works.

Open the file and examine the code:

```tsx title="apps/blog/src/app/[slug]/page.tsx" {5,10,13}
import { fetchPostBySlug } from '@repo/api/blog';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Back to posts
      </Link>

      <article className="flex flex-col gap-4">
        <header className="flex flex-col gap-2">
          <h1 className="font-bold text-4xl">{post.title}</h1>
          <p className="text-sm text-gray-500">
            {post.category} · {post.readingTime} min read
          </p>
          <p className="text-sm text-gray-500">By {post.author.name}</p>
        </header>

        <div className="prose max-w-none">
          {post.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
```

Key points:

- The folder name `[slug]` tells Next.js this is a dynamic segment
- `params` is typed as `Promise<{ slug: string }>` (Next.js 16 requirement)
- You must `await params` before accessing `slug`
- `fetchPostBySlug` comes from the shared `@repo/api` package
- `notFound()` triggers the 404 page when the post doesn't exist

**Try it now:**

Start the dev server from the monorepo root if not already running:

```bash
# From the monorepo root (nextjs-foundations/)
pnpm dev
```

The blog app runs on port 3001. Visit `http://localhost:3001` to see the blog index, then click any post to see the dynamic route in action. Notice the URL changes to match the post slug.

## Dynamic Routes and Prerendering

Dynamic routes like `[slug]` are dynamic (ƒ) by default, but they can prerender per segment value with `generateStaticParams()`. Each unique slug gets its own prerendered page:

```
Route (app)                              Size     First Load JS
├ ○ /[slug]                              1.2 kB   85.2 kB
│   ├ /hello-world                       (prerendered)
│   ├ /nextjs-routing                    (prerendered)
│   └ /react-tips                        (prerendered)
```

**How Next.js knows which slugs to prerender:**

1. **At build time:** Next.js discovers slugs from `generateStaticParams()`
2. **On-demand:** New slugs are rendered and cached on first request (when `dynamicParams = true`)

This is the foundation for caching per-resource data. In [Lesson 3.1: Cache Components](/03-advanced-patterns/cache-components), you'll learn to add `cacheTag('post-' + slug)` for fine-grained cache invalidation.

## Step 2: Add Static Generation

Now enhance the existing dynamic route with static generation. For better performance, pre-render popular posts at build time by adding `generateStaticParams`.

Open `apps/blog/src/app/[slug]/page.tsx` and add this function at the top of the file:

```tsx title="apps/blog/src/app/[slug]/page.tsx" {1,4-11}
import { fetchPostBySlug, fetchPosts } from '@repo/api/blog';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await fetchPosts(10); // Pre-render top 10 posts
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // ... rest of component unchanged
}
```

How `generateStaticParams` works:

- Runs at build time to determine which paths to pre-render
- Returns an array of param objects: `[{ slug: 'post-1' }, { slug: 'post-2' }]`
- Each object becomes a static HTML page (○ in build output)
- Paths not returned are rendered on-demand (dynamic) by default

\*\*Note: dynamicParams Behavior\*\*

By default, `dynamicParams = true`, meaning slugs not in `generateStaticParams` are rendered on-demand. Set `export const dynamicParams = false` to return 404 for unknown slugs instead.

\*\*Note: Cache Invalidation Preview\*\*

With `generateStaticParams()`, dynamic routes become static at build time. Each generated page is cached and served instantly. For cache invalidation after updates (like when a post is edited), see `cacheTag()` in [Lesson 3.1: Cache Components](/03-advanced-patterns/cache-components).

In development mode, `generateStaticParams` runs on-demand, not at startup. To see it in action:

```bash
# From the monorepo root
pnpm build
```

The build output shows which pages were pre-rendered as static HTML.

## Step 3: Explore the Blog Index

The starter also includes a blog index page that lists all posts. Open `apps/blog/src/app/page.tsx` to see how it works:

```tsx title="apps/blog/src/app/page.tsx" {1,5,14}
import { fetchPosts } from '@repo/api/blog';
import Link from 'next/link';

export default async function BlogHomePage() {
  const posts = await fetchPosts(10);

  return (
    <main className="flex flex-col gap-8">
      <h1 className="font-bold text-4xl">Blog</h1>

      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <article key={post.id} className="flex flex-col gap-2 border-b pb-6">
            <Link href={`/${post.slug}`} className="hover:underline">
              <h2 className="font-semibold text-2xl">{post.title}</h2>
            </Link>
            <p className="text-sm text-gray-500">
              {post.category} · {post.readingTime} min read
            </p>
            <p className="text-gray-700">{post.excerpt}</p>
            <Link
              href={`/${post.slug}`}
              className="text-sm text-blue-600 hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
```

Key points:

- `fetchPosts(10)` gets the 10 most recent posts
- Links use relative paths like `/${post.slug}` (no `/blog` prefix needed since this app is dedicated to the blog)
- Clicking a link navigates to the dynamic route you explored in Step 1

## Try It

1. **Visit the blog index:**
   Navigate to `http://localhost:3001`. You should see a list of posts.

2. **Click a post:**
   Click any post title. The URL changes to `http://localhost:3001/[actual-slug]` and shows the full post.

3. **Test the notFound pattern:**
   The demo API generates content for any slug (useful for development). In production with a real database, `fetchPostBySlug` would return `null` for missing posts, triggering `notFound()`. To see this in action, temporarily modify `apps/blog/src/app/[slug]/page.tsx` to force a 404:
   ```tsx
   if (!post || slug === 'test-not-found') {
     notFound();
   }
   ```
   Then visit `http://localhost:3001/test-not-found` to see the 404 page.

4. **Verify params are working:**
   Add this temporarily to your page to see the raw params:
   ```tsx
   <pre>{JSON.stringify({ slug }, null, 2)}</pre>
   ```

Expected output when visiting `http://localhost:3001/some-post-slug`:

```json
{
  "slug": "some-post-slug"
}
```

## Dynamic Route Patterns

Next.js supports three dynamic segment patterns:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Pattern              │ Example URL         │ params Shape              │
├─────────────────────────────────────────────────────────────────────────┤
│ [slug]               │ /blog/hello         │ { slug: "hello" }         │
│ [...slug]            │ /docs/a/b/c         │ { slug: ["a","b","c"] }   │
│ [[...slug]]          │ /shop or /shop/a/b  │ { slug: [] } or ["a","b"] │
└─────────────────────────────────────────────────────────────────────────┘
```

- **`[slug]`** - Single segment. Matches exactly one path part.
- **`[...slug]`** - Catch-all. Requires at least one segment. `/docs` alone returns 404.
- **`[[...slug]]`** - Optional catch-all. Matches zero or more segments. `/shop` works.

For this blog, `[slug]` is the right choice: each post has exactly one slug.

\*\*Note: When to Use Catch-All\*\*

Use `[...slug]` for nested documentation (`/docs/api/auth/oauth`) or category paths (`/products/electronics/phones`). The slug array lets you handle arbitrary depth.

## Catch-All Routes in Practice

\*\*Note: Switching Back to Web App\*\*

The following examples use `apps/web` (port 3000) to give you hands-on practice creating routes from scratch. The blog app already has its `[slug]` route configured, so we'll explore catch-all patterns in the web app where you can experiment freely.

This demonstrates another advantage of the monorepo architecture from Lesson 1.1: you can prototype and test routing patterns in one app without affecting the other.

The table shows three patterns, but the catch-all variants (`[...slug]` and `[[...slug]]`) have subtle differences that matter. Let's see them in action.

### Required Catch-All: `[...slug]`

A required catch-all matches one or more segments, but **does not match the base route**.

Create a documentation site structure:

```tsx title="apps/web/src/app/docs/[...slug]/page.tsx"
export default async function DocsPage(props: {
  params: Promise<{ slug: string[] }>
}) {
  const params = await props.params
  
  // params.slug is an array of path segments
  const path = params.slug.join('/')
  
  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Documentation</h1>
      <p className="mb-2">Full path: /docs/{path}</p>
      <p className="mb-4">Segments: {params.slug.length}</p>
      <ul className="list-disc pl-6">
        {params.slug.map((segment, i) => (
          <li key={i}>
            Segment {i}: {segment}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

**Key points:**

- `params.slug` is typed as `string[]`, not `string`
- URL `/docs/api/auth` produces `slug: ["api", "auth"]`
- URL `/docs/getting-started` produces `slug: ["getting-started"]`
- URL `/docs` **returns 404** (no segments to catch)

This pattern is correct when the base route (`/docs`) should either:

- Not exist at all, OR
- Be handled by a separate `apps/web/src/app/docs/page.tsx` file

### Optional Catch-All: `[[...slug]]`

An optional catch-all matches zero or more segments, including the base route.

Create a shop with optional category filtering:

```tsx title="apps/web/src/app/shop/[[...slug]]/page.tsx"
export default async function ShopPage(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  
  // params.slug is undefined when no segments present
  const categories = params.slug || []
  const isRoot = categories.length === 0
  
  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">
        {isRoot ? 'All Products' : 'Filtered Products'}
      </h1>
      {isRoot ? (
        <p>Showing all categories</p>
      ) : (
        <div>
          <p className="mb-2">Category path: /{categories.join('/')}</p>
          <p className="mb-4">Depth: {categories.length}</p>
          <ul className="list-disc pl-6">
            {categories.map((category, i) => (
              <li key={i}>
                Level {i + 1}: {category}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

**Key points:**

- `params.slug` is typed as `string[] | undefined`
- URL `/shop` produces `slug: undefined` (base route matches)
- URL `/shop/electronics` produces `slug: ["electronics"]`
- URL `/shop/electronics/phones` produces `slug: ["electronics", "phones"]`
- You must handle the undefined case when no segments are present

This pattern is correct when the base route should show content (like "all products" or a category root).

### Common Mistakes with Catch-All Routes

**Mistake 1: Treating slug as a string**

```tsx
// Wrong - slug is an array, not a string
const params = await props.params
const title = params.slug.toUpperCase() // Type error!

// Correct - join the array or access elements
const path = params.slug.join('/')
const firstSegment = params.slug[0]
```

**Mistake 2: Forgetting params is async**

```tsx
// Wrong - accessing params before awaiting
export default async function Page(props: {
  params: Promise<{ slug: string[] }>
}) {
  const slug = props.params.slug // Runtime error!
  
  // Correct - await first
  const params = await props.params
  const slug = params.slug
}
```

**Mistake 3: Using required catch-all when base route should match**

```tsx
// File: app/products/[...slug]/page.tsx
// Problem: /products returns 404, but you want it to show "all products"

// Solution: Use optional catch-all instead
// File: app/products/[[...slug]]/page.tsx
// Now /products works AND /products/electronics works
```

### Try It: Catch-All Routes

1. **Create the required catch-all route:**

   ```bash
   mkdir -p "apps/web/src/app/docs/[...slug]"
   ```

   Add the DocsPage component from above to `apps/web/src/app/docs/[...slug]/page.tsx`.

2. **Test the required catch-all:**
   - Visit `http://localhost:3000/docs/api` - should render with `slug: ["api"]`
   - Visit `http://localhost:3000/docs/api/auth/oauth` - should render with `slug: ["api", "auth", "oauth"]`
   - Visit `http://localhost:3000/docs` - should show **404** (required catch-all needs at least one segment)

3. **Create the optional catch-all route:**

   ```bash
   mkdir -p "apps/web/src/app/shop/[[...slug]]"
   ```

   Add the ShopPage component from above to `apps/web/src/app/shop/[[...slug]]/page.tsx`.

4. **Test the optional catch-all:**
   - Visit `http://localhost:3000/shop` - should render with "All Products" (slug is undefined)
   - Visit `http://localhost:3000/shop/electronics` - should render with `slug: ["electronics"]`
   - Visit `http://localhost:3000/shop/electronics/phones/iphone` - should render with all three segments

5. **Verify the type difference:**
   Add this to inspect the raw params in your browser:
   ```tsx
   <pre className="mt-4 rounded bg-gray-100 p-4">
     {JSON.stringify({ slug: params.slug }, null, 2)}
   </pre>
   ```

**Expected behavior:**

| URL Pattern    | Required `[...slug]`      | Optional `[[...slug]]`    |
| -------------- | ------------------------- | ------------------------- |
| `/route`       | 404                       | `{ slug: undefined }`     |
| `/route/a`     | `{ slug: ["a"] }`         | `{ slug: ["a"] }`         |
| `/route/a/b/c` | `{ slug: ["a","b","c"] }` | `{ slug: ["a","b","c"] }` |

\*\*Warning: Quiz Alert\*\*

Questions 11 and 12 in the quiz test your understanding of when to use `[...slug]` vs `[[...slug]]`. The key difference is whether the base route (like `/shop`) should match or return 404.

## Commit

```bash
git add -A
git commit -m "feat: add generateStaticParams to blog dynamic route"
git push
```

## Done-When

- [ ] You understand how `apps/blog/src/app/[slug]/page.tsx` uses async params
- [ ] `generateStaticParams` is added to `apps/blog/src/app/[slug]/page.tsx`
- [ ] You understand that dynamic routes prerender per segment with `generateStaticParams()`
- [ ] Visiting `http://localhost:3001` shows the blog index
- [ ] Clicking a post navigates to `http://localhost:3001/[slug]` and renders the full post
- [ ] `notFound()` is called when post is null (verified by testing with a non-existent slug)

## Troubleshooting

params.slug is undefined

You're accessing params before awaiting:

```tsx
// Wrong - params is a Promise
const slug = props.params.slug

// Correct - await first
const params = await props.params
const slug = params.slug
```

In Next.js 16, `params` is always a Promise in Server Components.

Module not found: @repo/api/blog

The `@repo/api` package should already be configured. Check that:

1. `packages/api/src/blog.ts` exists
2. `packages/api/package.json` has the export configured
3. Run `pnpm install` to ensure dependencies are linked

If issues persist, check `apps/blog/package.json` includes `@repo/api` in dependencies.

notFound is not a function

Import it from the correct location:

```tsx
import { notFound } from 'next/navigation'
```

Not from `next/router` (that's Pages Router).

generateStaticParams not running

In dev mode, `generateStaticParams` runs on-demand, not at startup. To verify it works, run from the monorepo root:

```bash
pnpm build
```

You'll see the static pages listed in the build output.

\*\*Note: Still Stuck?\*\*

Ask your coding agent for help. Paste the error message and it can diagnose the issue.

````markdown title="Prompt: Debug Next.js 16 Async Params"
I'm getting undefined params in my Next.js 16 dynamic route.

**Error or unexpected behavior:**
```
___DESCRIBE_WHAT_HAPPENS___
```

Example: "params.slug is undefined" or "Cannot read property 'id' of undefined"

**My page component:**
```tsx
// File path: _____
// Example: src/app/blog/[slug]/page.tsx

___PASTE_YOUR_PAGE_COMPONENT___
```

**The URL I'm visiting:** /_____
**Expected param value:** _____

**Note:** Next.js 16 changed params to be async. The old pattern was:
```tsx
// OLD (Next.js 14)
export default function Page({ params }) {
  return <div>{params.slug}</div>
}

// NEW (Next.js 16)
export default async function Page({ params }) {
  const { slug } = await params
  return <div>{slug}</div>
}
```

Am I using the correct async params pattern? What's wrong with my implementation?
````

## Solution

Modified blog post page with generateStaticParams

### Add generateStaticParams to Existing File

The only change needed is adding the `generateStaticParams` function and importing `fetchPosts`:

```tsx title="apps/blog/src/app/[slug]/page.tsx" {1,4-11}
import { fetchPostBySlug, fetchPosts } from '@repo/api/blog';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await fetchPosts(10);
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Back to posts
      </Link>

      <article className="flex flex-col gap-4">
        <header className="flex flex-col gap-2">
          <h1 className="font-bold text-4xl">{post.title}</h1>
          <p className="text-sm text-gray-500">
            {post.category} · {post.readingTime} min read ·{' '}
            {post.publishedAt.toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">By {post.author.name}</p>
        </header>

        <div className="prose max-w-none">
          {post.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <footer className="flex flex-wrap gap-2 border-t pt-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-600"
            >
              {tag}
            </span>
          ))}
        </footer>
      </article>
    </main>
  );
}
```

### Key Implementation Notes

1. **Async params pattern**: The existing file already uses `await params` correctly. This is required in Next.js 16.

2. **generateStaticParams**: Returns an array of param objects. Each becomes a pre-rendered page. The `slug` property must match your folder name `[slug]`.

3. **notFound()**: Already imported from `next/navigation`. Triggers the nearest `not-found.tsx` file or the default 404 page.

4. **Data fetching**: `fetchPostBySlug` and `fetchPosts` are from `@repo/api/blog`. The API uses faker.js to generate realistic post data.

5. **Fallback behavior**: By default (`dynamicParams = true`), slugs not in `generateStaticParams` are rendered on-demand. Add `export const dynamicParams = false` to 404 on unknown slugs.

6. **Blog index**: The `apps/blog/src/app/page.tsx` file already exists with the blog listing. No changes needed there.

\*\*Side Quest: Add Dynamic Metadata with OG Images\*\*

## Learn More

- [Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) - File conventions for `[slug]`, `[...slug]`, `[[...slug]]`
- [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) - Pre-render dynamic routes at build time
- [notFound](https://nextjs.org/docs/app/api-reference/functions/not-found) - Trigger 404 responses

## What's Next

You now have dynamic routes that fetch real data and handle missing resources gracefully. The next lesson covers environment variables and security, showing you how to safely manage secrets that your Server Components can access while keeping them hidden from the client bundle.


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
