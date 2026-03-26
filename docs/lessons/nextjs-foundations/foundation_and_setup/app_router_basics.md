---
title: "App Router Basics"
description: "Learn the App Router mental model: folders become routes, special files control behavior. Build a route tree with layouts, loading states, error boundaries (components that catch JavaScript errors and display fallback UI), and API routes."
canonical_url: "https://vercel.com/academy/nextjs-foundations/app-router-basics"
md_url: "https://vercel.com/academy/nextjs-foundations/app-router-basics.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-09T23:36:37.880Z"
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

# App Router Basics

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# App Router Basics

You created `pages/about.js` but the route doesn't exist. You added a `getServerSideProps` but it never runs. You're fighting the framework because you're thinking in Pages Router while writing App Router code.

The App Router flips the mental model: your folder structure *is* your routing. No configuration files, no route manifests. Create a folder, add a `page.tsx`, and you have a route. Once you internalize this, Next.js stops feeling like magic.

This lesson covers the seven special files that control how routes behave: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`, and route groups.

## Outcome

A working route tree in `apps/web` with nested layouts, loading states, error boundaries, an API endpoint, and a route group for organization.

## Fast Track

1. Create `src/app/(marketing)/about/page.tsx` with a marketing layout
2. Add `src/app/api/ping/route.ts` returning `{ ok: true }`
3. Add `loading.tsx`, `error.tsx`, and `not-found.tsx` to handle edge cases

## The Mental Model

```
URL Path          Folder Structure                Build Output
────────────────────────────────────────────────────────────────
/                 src/app/page.tsx                ○ (Static)
/about            src/app/about/page.tsx          ○ (Static)
/products/[id]    src/app/products/[id]/page.tsx  ○ (Static)*
/api/ping         src/app/api/ping/route.ts       ƒ (Dynamic)

○ = Prerendered at build time, served instantly
ƒ = Rendered per request, always fresh
* Dynamic routes can prerender with generateStaticParams()
```

Every folder segment becomes a URL segment. The `page.tsx` file makes that segment accessible. Without `page.tsx`, the folder is just for organization. **By default, pages prerender (○) unless they use dynamic APIs.**

## Special Files Reference

| File                                                                                    | Purpose                                 | Renders                 |
| --------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| [`page.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/page)           | Makes route accessible                  | The page content        |
| [`layout.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/layout)       | Wraps pages, persists across navigation | Shared UI (nav, footer) |
| [`loading.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/loading)     | Shows during async operations           | Loading skeleton        |
| [`error.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/error)         | Catches errors in segment               | Error UI with retry     |
| [`not-found.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) | Handles 404s                            | Not found message       |
| [`route.ts`](https://nextjs.org/docs/app/api-reference/file-conventions/route)          | API endpoint (no UI)                    | JSON responses          |

## Metadata API

Every page needs a title and description for SEO (Search Engine Optimization, helping search engines understand and rank your pages). Next.js provides the Metadata API to handle this. You export metadata directly from pages and layouts, and Next.js automatically generates the `<head>` tags.

### Static Metadata

For pages with fixed content, export a `metadata` object:

```tsx title="apps/web/src/app/(marketing)/about/page.tsx"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about our mission and team',
}

export default function AboutPage() {
  return <div>About content</div>
}
```

This generates:

```html
<title>About Us</title>
<meta name="description" content="Learn about our mission and team" />
```

### Dynamic Metadata

For pages that depend on route parameters or fetched data, use `generateMetadata`:

```tsx title="apps/web/src/app/products/[slug]/page.tsx"
import type { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const product = await fetchProduct(slug)
  
  return {
    title: product.name,
    description: product.description,
  }
}
```

Next.js waits for `generateMetadata` to resolve before rendering the page. Both run in parallel for performance.

### Metadata Inheritance

Metadata merges from root to leaf. Child values override parent values. This is useful for site-wide defaults:

```tsx title="apps/web/src/app/layout.tsx"
export const metadata: Metadata = {
  title: {
    template: '%s | Next.js Foundations',
    default: 'Next.js Foundations',
  },
}
```

```tsx title="apps/web/src/app/(marketing)/about/page.tsx"
export const metadata: Metadata = {
  title: 'About Us', // Becomes "About Us | Next.js Foundations"
}
```

The root layout sets `title.template` with `%s` as a placeholder. Child pages set `title` as a string, and Next.js substitutes it into the template.

\*\*Warning: Server Components Only\*\*

You can only export `metadata` or `generateMetadata` from Server Components. Client Components cannot set metadata. If you need metadata based on client state, lift the logic to a parent Server Component.

## Step 1: Create a Route Group and Layout

Route groups organize code without affecting URLs. The `(marketing)` folder groups related pages but `/about` stays `/about`, not `/marketing/about`.

Create the marketing layout:

```tsx title="apps/web/src/app/(marketing)/layout.tsx"
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <header className="mb-8 border-b py-4">
        <nav className="flex gap-4">
          <a href="/" className="font-semibold">Home</a>
          <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
          <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mt-8 border-t py-4 text-gray-500 text-sm">
        © 2026 Next.js Foundations
      </footer>
    </div>
  )
}
```

Now create the about page:

```tsx title="apps/web/src/app/(marketing)/about/page.tsx"
export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 font-bold text-3xl">About Us</h1>
      <p className="text-gray-600">
        This page uses the marketing layout. Notice the header and footer
        are defined once in the layout and wrap this content automatically.
      </p>
    </div>
  )
}
```

\*\*Note: Layout Composition\*\*

Layouts nest automatically. The marketing layout wraps the about page, and the root layout wraps everything. You never manually compose them.

## Step 2: Add an API Route

API routes use `route.ts` instead of `page.tsx`. They export HTTP method handlers:

```ts title="apps/web/src/app/api/ping/route.ts"
import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({ ok: true, timestamp: Date.now() })
}
```

Test it:

```bash
curl http://localhost:3000/api/ping
```

```json
{"ok":true,"timestamp":1736350000000}
```

\*\*Note: When to Use API Routes\*\*

Use `route.ts` for webhooks, third-party integrations, or when you need raw HTTP control. For data fetching in your own app, Server Components are usually simpler.

\*\*Note: Why API Routes Are Always Dynamic\*\*

API routes (`route.ts`) are always dynamic (ƒ) because they handle HTTP requests at runtime. Unlike pages, they cannot be prerendered: each request may have different headers, body, or query parameters that affect the response.

## Step 3: Add Loading State

`loading.tsx` automatically wraps the page in a React Suspense boundary. When the page has async operations, the loading UI shows.

```tsx title="apps/web/src/app/(marketing)/about/loading.tsx"
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-8 w-1/3 rounded bg-gray-200" />
      <div className="mb-2 h-4 w-full rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
    </div>
  )
}
```

To see it in action, add a delay to the about page:

```tsx title="apps/web/src/app/(marketing)/about/page.tsx" {1-5}
// Simulate slow data fetch
async function getAboutData() {
  await new Promise(resolve => setTimeout(resolve, 2000))
  return { founded: 2026, team: 'Distributed' }
}

export default async function AboutPage() {
  const data = await getAboutData()
  
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 font-bold text-3xl">About Us</h1>
      <p className="mb-4 text-gray-600">
        This page uses the marketing layout. Notice the header and footer
        are defined once in the layout and wrap this content automatically.
      </p>
      <p className="text-gray-500 text-sm">
        Founded: {data.founded} · Team: {data.team}
      </p>
    </div>
  )
}
```

Navigate to `/about` and you'll see the skeleton for 2 seconds before the content appears.

## Step 4: Add Error Boundary

`error.tsx` catches errors in its segment and children. It must be a Client Component because it uses React's error boundary API:

```tsx title="apps/web/src/app/(marketing)/error.tsx"
'use client'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-4">
      <h2 className="mb-2 font-semibold text-lg text-red-800">
        Something went wrong
      </h2>
      <p className="mb-4 text-red-600 text-sm">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  )
}
```

To test it, temporarily throw an error in a page:

```tsx title="apps/web/src/app/(marketing)/about/page.tsx" {3}
export default async function AboutPage() {
  // Uncomment to test error boundary
  // throw new Error('Test error boundary')
  
  return (
    // ... rest of component
  )
}
```

## Step 5: Add Not Found Handler

`not-found.tsx` handles 404s. You can trigger it programmatically with `notFound()`:

```tsx title="apps/web/src/app/not-found.tsx"
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <h1 className="mb-4 font-bold text-4xl">404</h1>
      <p className="mb-4 text-gray-600">This page doesn't exist.</p>
      <Link 
        href="/"
        className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
      >
        Go home
      </Link>
    </div>
  )
}
```

Navigate to any non-existent route like `/asdfasdf` to see it.

````markdown title="Prompt: Explain App Router File Resolution"
I have a Next.js 16 App Router project and I'm confused about which special files apply to my route.

**My folder structure:**
```
src/app/
___PASTE_YOUR_FOLDER_STRUCTURE___
```

Example structure:
```
src/app/
├── layout.tsx
├── loading.tsx
├── error.tsx
├── (marketing)/
│   ├── layout.tsx
│   └── about/
│       └── page.tsx
```

**The route I'm visiting:** /_____

**My questions:**
1. Which layout files wrap this page (in order)?
2. Which loading.tsx shows during navigation?
3. Which error.tsx catches errors from this page?
4. Does my route group `(marketing)` affect the URL?

Explain the file resolution order for my specific route.
````

## File Structure

After completing this lesson, your `apps/web/src/app` should look like:

```
src/app/
├── (marketing)/
│   ├── layout.tsx        # Marketing header/footer
│   ├── error.tsx         # Error boundary for marketing pages
│   └── about/
│       ├── page.tsx      # About page content
│       └── loading.tsx   # Loading skeleton
├── api/
│   └── ping/
│       └── route.ts      # Health check endpoint
├── not-found.tsx         # Global 404 handler
├── layout.tsx            # Root layout (already exists)
└── page.tsx              # Home page (already exists)
```

## Try It

1. **Test the layout**: Navigate to `http://localhost:3000/about`. You should see the marketing header/footer wrapping the about content.

2. **Test the API**: Run `curl http://localhost:3000/api/ping` and verify you get:
   ```json
   {"ok":true,"timestamp":1736350000000}
   ```

3. **Test loading state**: The about page has a 2-second delay. Refresh `/about` and watch the skeleton appear.

4. **Test 404**: Navigate to `http://localhost:3000/does-not-exist` and verify the not-found page renders.

5. **Observe build output**: Run `pnpm build` from `apps/web` and look at the route table:

   ```bash
   pnpm build --filter=@repo/web
   ```

   You should see output like:

   ```
   Route (app)                    Size     First Load JS
   ┌ ○ /                          5.2 kB   89.2 kB
   ├ ○ /_not-found                140 B    85.1 kB
   ├ ○ /about                     1.2 kB   85.2 kB
   └ ƒ /api/ping                  0 B      0 B

    ○  (Static)   prerendered as static content
    ƒ  (Dynamic)  server-rendered on demand
   ```

   The "First Load JS" column shows the total JavaScript sent to the browser when a user first visits that route, including shared framework code. Notice `/about` is static (○) while `/api/ping` is dynamic (ƒ). This is your first glimpse of how Next.js decides what to cache.

## Commit

```bash
git add -A
git commit -m "feat: add app router fundamentals - layouts, loading, error, api"
git push
```

Check `vercel list` to confirm the preview deployment.

## Done-When

- [ ] `/about` shows marketing layout (header with Home/About/Pricing links, footer)
- [ ] `curl localhost:3000/api/ping` returns `{"ok":true,"timestamp":...}`
- [ ] Refreshing `/about` shows loading skeleton for \~2 seconds
- [ ] `/does-not-exist` shows the 404 page with "Go home" link
- [ ] `pnpm build` output shows `/about` as ○ (static) and `/api/ping` as ƒ (dynamic)

## Solution

Complete file implementations

### Marketing Layout

```tsx title="apps/web/src/app/(marketing)/layout.tsx"
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <header className="mb-8 border-b py-4">
        <nav className="flex gap-4">
          <a href="/" className="font-semibold">Home</a>
          <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
          <a href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mt-8 border-t py-4 text-gray-500 text-sm">
        © 2026 Next.js Foundations
      </footer>
    </div>
  )
}
```

### About Page with Delay

```tsx title="apps/web/src/app/(marketing)/about/page.tsx"
async function getAboutData() {
  await new Promise(resolve => setTimeout(resolve, 2000))
  return { founded: 2026, team: 'Distributed' }
}

export default async function AboutPage() {
  const data = await getAboutData()
  
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 font-bold text-3xl">About Us</h1>
      <p className="mb-4 text-gray-600">
        This page uses the marketing layout. Notice the header and footer
        are defined once in the layout and wrap this content automatically.
      </p>
      <p className="text-gray-500 text-sm">
        Founded: {data.founded} · Team: {data.team}
      </p>
    </div>
  )
}
```

### Loading Skeleton

```tsx title="apps/web/src/app/(marketing)/about/loading.tsx"
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-8 w-1/3 rounded bg-gray-200" />
      <div className="mb-2 h-4 w-full rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
    </div>
  )
}
```

### Error Boundary

```tsx title="apps/web/src/app/(marketing)/error.tsx"
'use client'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-4">
      <h2 className="mb-2 font-semibold text-lg text-red-800">
        Something went wrong
      </h2>
      <p className="mb-4 text-red-600 text-sm">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  )
}
```

### API Route

```ts title="apps/web/src/app/api/ping/route.ts"
import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({ ok: true, timestamp: Date.now() })
}
```

### Not Found

```tsx title="apps/web/src/app/not-found.tsx"
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <h1 className="mb-4 font-bold text-4xl">404</h1>
      <p className="mb-4 text-gray-600">This page doesn't exist.</p>
      <Link 
        href="/"
        className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
      >
        Go home
      </Link>
    </div>
  )
}
```

\*\*Side Quest: Add Modal with Intercepting Routes\*\*

## Learn More

- [Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) - Official guide to creating pages and layouts
- [Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) - Organize routes without affecting URLs
- [loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading) - Suspense boundaries with loading UI
- [error.js](https://nextjs.org/docs/app/api-reference/file-conventions/error) - Error boundaries and recovery
- [not-found.js](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) - 404 handling
- [route.js](https://nextjs.org/docs/app/api-reference/file-conventions/route) - API route handlers

## What's Next

You now understand how folders map to routes and how special files control behavior. But notice something: every component we wrote is a Server Component by default. In the next lesson, you'll learn when and why to add `'use client'`, and how to think about the Server/Client boundary.


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
