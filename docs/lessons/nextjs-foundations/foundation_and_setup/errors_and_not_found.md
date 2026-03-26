---
title: "Errors and Not Found"
description: "Implement error.tsx for graceful error handling with reset functionality, customize not-found.tsx for 404s, and understand how error boundaries bubble through the route tree."
canonical_url: "https://vercel.com/academy/nextjs-foundations/errors-and-not-found"
md_url: "https://vercel.com/academy/nextjs-foundations/errors-and-not-found.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-09T23:38:21.459Z"
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

# Errors and Not Found

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Errors and Not Found

An uncaught error during render crashes your entire app. Users see a blank screen or a cryptic React error. One buggy component takes down everything: navigation, footer, sibling routes. This is unacceptable in production.

Next.js solves this with file-based error boundaries. Drop an `error.tsx` in any route segment and errors in that subtree get caught automatically. The rest of your app keeps working. Users see a helpful error message and a button to try again.

## Outcome

Working error boundaries at root and route levels that catch rendering errors, display helpful messages, and offer recovery via `reset()`. Custom 404 pages for missing routes and programmatic not-found triggers.

## Fast Track

1. Create `apps/web/src/app/error.tsx` with `'use client'` directive, receiving `error` and `reset` props
2. Create `apps/web/src/app/not-found.tsx` for custom 404 styling
3. Create a test route that throws to verify the boundary catches it

\*\*Warning: error.tsx Must Be a Client Component\*\*

Unlike other Next.js file conventions, `error.tsx` requires the `'use client'` directive. This is because React error boundaries use client-side features like `componentDidCatch` and state management. Without `'use client'`, your build will fail.

## Building on Dynamic Routing

In [Dynamic Routing](/01-foundation-and-setup/dynamic-routing), you used `notFound()` to handle missing blog posts:

```tsx
if (!post) {
  notFound()
}
```

That function triggers a 404 response and renders the nearest `not-found.tsx`. But you were using the default Next.js 404 page. This lesson teaches you to customize that page and, more importantly, handle a different category of problem: runtime errors during rendering.

The key distinction:

- **`notFound()`** - You know something is missing, handle it gracefully
- **`error.tsx`** - Something unexpected broke, catch it and recover

## Self-Paced Exercise

**Requirements:**

1. Create a root error boundary that catches errors from any route
2. Create a custom 404 page that matches your app's design
3. Create a test route that intentionally throws an error
4. Demonstrate the `reset()` function recovers the UI

**Implementation hints:**

- `error.tsx` receives two props: `error` (the thrown error) and `reset` (a function to retry rendering)
- The `error.digest` property is an auto-generated hash for matching client errors with server logs (so you can trace what happened on the server when a user reports an error)
- `not-found.tsx` is a Server Component by default (no `'use client'` needed)
- Error boundaries catch errors in their child routes, not in the same file's layout
- Create a route that throws conditionally (e.g., based on searchParams) so you can toggle errors

## Background: React Error Boundaries

Before diving into `error.tsx`, you should understand what's happening under the hood.

In React, an **Error Boundary** is a class component that catches JavaScript errors anywhere in its child component tree. Without error boundaries, a thrown error unmounts the entire React tree, leaving users with a blank screen. Error boundaries let you display a fallback UI instead.

Here's what a traditional React error boundary looks like:

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>
    }
    return this.props.children
  }
}
```

Notice two things:

1. Error boundaries **must be class components**: hooks like `useState` can't catch render errors
2. You'd need to manually wrap components: `<ErrorBoundary><MyPage /></ErrorBoundary>`

Next.js eliminates this boilerplate with the `error.tsx` file convention. When you create `error.tsx` in a route folder, Next.js automatically wraps that route segment in an error boundary. You write a simple function component that receives `error` and `reset` props. Next.js handles the class component machinery for you.

\*\*Note: Why 'use client'?\*\*

Since React error boundaries require class component lifecycle methods (`componentDidCatch`), they only work on the client. That's why `error.tsx` needs the `'use client'` directive: Next.js generates a class-based error boundary wrapper that can only run in the browser.

For a deeper dive into React error boundaries, see the [React documentation on error boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).

## Step 1: Create the Root Error Boundary

Create the error boundary at the app root:

```tsx title="apps/web/src/app/error.tsx"
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: Intentional for error reporting demonstration
    console.error('Root error boundary caught:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="mb-2 font-bold text-2xl text-red-800">
          Something went wrong
        </h2>
        <p className="mb-4 text-red-600">
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.digest && (
          <p className="mb-4 font-mono text-red-400 text-xs">
            Error ID: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="rounded bg-red-600 px-6 py-2 font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

Key points:

- `'use client'` is **required** because error boundaries use React state and effects
- `error.digest` is an auto-generated hash for matching client errors to server logs
- `reset()` attempts to re-render the route segment, useful for transient errors
- The `useEffect` runs when an error is caught, ideal for logging to services like Sentry

## Step 2: Create a Custom 404 Page

Create a custom not-found page:

```tsx title="apps/web/src/app/not-found.tsx"
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <h1 className="mb-2 font-bold text-6xl text-gray-900">404</h1>
      <p className="mb-6 text-gray-600 text-xl">Page not found</p>
      <p className="mb-8 max-w-md text-center text-gray-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-800"
      >
        Go home
      </Link>
    </div>
  )
}
```

This page renders when:

- A user navigates to a URL that doesn't match any route
- Your code calls `notFound()` from `next/navigation`

## Step 3: Create a Test Route for Errors

Create a route that throws errors conditionally:

```bash
mkdir -p apps/web/src/app/error-demo
```

```tsx title="apps/web/src/app/error-demo/page.tsx"
import Link from 'next/link'

export default async function ErrorDemoPage(props: {
  searchParams: Promise<{ throw?: string }>
}) {
  const searchParams = await props.searchParams

  // Conditionally throw based on URL param
  if (searchParams.throw === 'true') {
    throw new Error('This error was triggered intentionally for testing')
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 font-bold text-3xl">Error Boundary Demo</h1>
      <p className="mb-6 text-gray-600">
        This page demonstrates how error boundaries work in Next.js.
      </p>

      <div className="space-y-4">
        <div className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Trigger an Error</h2>
          <p className="mb-4 text-gray-600 text-sm">
            Click below to throw an error and see the error boundary in action.
          </p>
          <Link
            href="/error-demo?throw=true"
            className="inline-block rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Throw Error
          </Link>
        </div>

        <div className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Safe Navigation</h2>
          <p className="mb-4 text-gray-600 text-sm">
            This link loads the page without triggering an error.
          </p>
          <Link
            href="/error-demo"
            className="inline-block rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          >
            Load Normally
          </Link>
        </div>
      </div>
    </main>
  )
}
```

## Step 4: Create a Nested Error Boundary

Error boundaries catch errors in their child routes. Create a more specific boundary for a route group:

```tsx title="apps/web/src/app/error-demo/error.tsx"
'use client'

import { useEffect } from 'react'

export default function ErrorDemoBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: Intentional for error reporting demonstration
    console.error('Error demo boundary caught:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-6">
        <h2 className="mb-2 font-bold text-xl text-orange-800">
          Demo Error Caught!
        </h2>
        <p className="mb-4 text-orange-700">
          This error was caught by the nested error boundary in /error-demo.
        </p>
        <p className="mb-4 font-mono text-orange-600 text-sm">
          {error.message}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
          >
            Try Again
          </button>
          <a
            href="/error-demo"
            className="rounded border border-orange-600 px-4 py-2 text-orange-600 hover:bg-orange-100"
          >
            Reload Page
          </a>
        </div>
      </div>
    </div>
  )
}
```

Now the `/error-demo` route has its own error boundary. Errors in this route won't bubble up to the root boundary.

## How Error Boundaries Work

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Error Boundary Hierarchy                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  app/                                                               │
│  ├── layout.tsx          ← NOT caught by app/error.tsx              │
│  ├── error.tsx           ← Catches errors from child routes         │
│  ├── page.tsx            ← Caught by app/error.tsx                  │
│  └── error-demo/                                                    │
│      ├── error.tsx       ← Catches errors in this subtree           │
│      └── page.tsx        ← Caught by error-demo/error.tsx           │
│                                                                     │
│  Error bubbles UP until caught by nearest error.tsx                 │
│  Root layout errors need global-error.tsx                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

Key behaviors:

- Errors bubble **up** the route tree until caught
- An `error.tsx` catches errors from **child** routes, not siblings or parents
- The root layout (`app/layout.tsx`) isn't caught by `app/error.tsx` because they're at the same level
- For root layout errors, use `app/global-error.tsx` (must include `<html>` and `<body>` tags)

## Try It

1. **Start the dev server:**
   ```bash
   pnpm dev
   ```

2. **Test the error boundary:**
   Navigate to `http://localhost:3000/error-demo`, then click "Throw Error". You should see:
   - The orange nested error boundary UI
   - The error message: "This error was triggered intentionally for testing"
   - A "Try Again" button

3. **Test error recovery:**
   Click "Try Again". The page attempts to re-render. Since the URL still has `?throw=true`, it throws again. Click "Reload Page" to navigate without the error param.

4. **Test the 404 page:**
   Navigate to `http://localhost:3000/this-page-does-not-exist`. You should see your custom 404 page with "Page not found" and a "Go home" link.

5. **Verify the blog notFound still works:**
   Navigate to `http://localhost:3001/test-not-found`. If you added the notFound trigger from [Dynamic Routing](/01-foundation-and-setup/dynamic-routing), this shows your custom 404.

Expected error boundary output:

```
┌──────────────────────────────────────────────────────────────────┐
│                        Demo Error Caught!                        │
│                                                                  │
│  This error was caught by the nested error boundary              │
│  in /error-demo.                                                 │
│                                                                  │
│  This error was triggered intentionally for testing              │
│                                                                  │
│  ┌───────────┐  ┌─────────────┐                                 │
│  │ Try Again │  │ Reload Page │                                 │
│  └───────────┘  └─────────────┘                                 │
└──────────────────────────────────────────────────────────────────┘
```

## Commit

```bash
git add -A
git commit -m "feat: add error boundaries and custom 404 page"
git push
```

## Done-When

- [ ] `http://localhost:3000/error-demo?throw=true` shows the orange nested error boundary
- [ ] Clicking "Try Again" attempts to re-render the page
- [ ] `http://localhost:3000/nonexistent-page` shows your custom 404 with "Page not found"
- [ ] The root `error.tsx` has `'use client'` directive and receives `error` and `reset` props
- [ ] Console shows "Error demo boundary caught:" with the error when triggered

## Troubleshooting

Error: error.tsx must be a Client Component

You're missing the `'use client'` directive at the top of the file:

```tsx
// Must be the FIRST line
'use client'

export default function Error({ error, reset }) {
  // ...
}
```

This is required because React error boundaries use client-side features.

Error boundary not catching errors

Error boundaries only catch errors in **child** routes, not:

- Errors in the same file's layout
- Errors in event handlers (use try/catch instead)
- Errors in async Server Component functions that aren't during render

To test, ensure your error-throwing component is in a child route of the error boundary.

Reset doesn't fix the error

`reset()` re-renders the route segment. If the error condition still exists (like `?throw=true` in the URL), it throws again. This is expected behavior.

For transient errors (like network failures), reset works well. For persistent issues (like invalid data), you need to fix the underlying cause.

404 page not showing custom design

Make sure your `not-found.tsx` is in the correct location:

- For app-wide 404: `apps/web/src/app/not-found.tsx`
- For route-specific 404: `apps/web/src/app/some-route/not-found.tsx`

The file must be named exactly `not-found.tsx` (not `notfound.tsx` or `NotFound.tsx`).

\*\*Note: Still Stuck?\*\*

Ask your coding agent for help. Paste the error message and it can diagnose the issue.

````markdown title="Prompt: Debug Error Boundary Not Catching Errors"
My `error.tsx` isn't catching errors in Next.js 16.

**My error.tsx file:**
```tsx
// File location: _____
// Example: src/app/dashboard/error.tsx

___PASTE_YOUR_ERROR_TSX___
```

**The component throwing the error:**
```tsx
// File location: _____
// Example: src/app/dashboard/stats/page.tsx

___PASTE_COMPONENT_WITH_ERROR___
```

**The error I expect to catch:**
```
___DESCRIBE_OR_PASTE_ERROR___
```

**What happens instead:**
- [ ] App crashes completely (white screen)
- [ ] Error shows in a different error.tsx
- [ ] Error shows in browser console but no error UI
- [ ] Other: _____

**Checklist:**
- [ ] My error.tsx has `'use client'` directive
- [ ] My error.tsx exports a default function
- [ ] My error.tsx accepts `error` and `reset` props
- [ ] error.tsx is in the same folder or parent of the throwing component

Why isn't my error boundary catching this error?
````

## Solution

Complete implementation

### Root Error Boundary

```tsx title="apps/web/src/app/error.tsx"
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: Intentional for error reporting demonstration
    console.error('Root error boundary caught:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="mb-2 font-bold text-2xl text-red-800">
          Something went wrong
        </h2>
        <p className="mb-4 text-red-600">
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.digest && (
          <p className="mb-4 font-mono text-red-400 text-xs">
            Error ID: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="rounded bg-red-600 px-6 py-2 font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
```

### Custom 404 Page

```tsx title="apps/web/src/app/not-found.tsx"
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <h1 className="mb-2 font-bold text-6xl text-gray-900">404</h1>
      <p className="mb-6 text-gray-600 text-xl">Page not found</p>
      <p className="mb-8 max-w-md text-center text-gray-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-800"
      >
        Go home
      </Link>
    </div>
  )
}
```

### Error Demo Page

```tsx title="apps/web/src/app/error-demo/page.tsx"
import Link from 'next/link'

export default async function ErrorDemoPage(props: {
  searchParams: Promise<{ throw?: string }>
}) {
  const searchParams = await props.searchParams

  if (searchParams.throw === 'true') {
    throw new Error('This error was triggered intentionally for testing')
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 font-bold text-3xl">Error Boundary Demo</h1>
      <p className="mb-6 text-gray-600">
        This page demonstrates how error boundaries work in Next.js.
      </p>

      <div className="space-y-4">
        <div className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Trigger an Error</h2>
          <p className="mb-4 text-gray-600 text-sm">
            Click below to throw an error and see the error boundary in action.
          </p>
          <Link
            href="/error-demo?throw=true"
            className="inline-block rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Throw Error
          </Link>
        </div>

        <div className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Safe Navigation</h2>
          <p className="mb-4 text-gray-600 text-sm">
            This link loads the page without triggering an error.
          </p>
          <Link
            href="/error-demo"
            className="inline-block rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          >
            Load Normally
          </Link>
        </div>
      </div>
    </main>
  )
}
```

### Nested Error Boundary

```tsx title="apps/web/src/app/error-demo/error.tsx"
'use client'

import { useEffect } from 'react'

export default function ErrorDemoBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: Intentional for error reporting demonstration
    console.error('Error demo boundary caught:', error)
  }, [error])

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-6">
        <h2 className="mb-2 font-bold text-xl text-orange-800">
          Demo Error Caught!
        </h2>
        <p className="mb-4 text-orange-700">
          This error was caught by the nested error boundary in /error-demo.
        </p>
        <p className="mb-4 font-mono text-orange-600 text-sm">
          {error.message}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
          >
            Try Again
          </button>
          <a
            href="/error-demo"
            className="rounded border border-orange-600 px-4 py-2 text-orange-600 hover:bg-orange-100"
          >
            Reload Page
          </a>
        </div>
      </div>
    </div>
  )
}
```

### Key Implementation Notes

1. **`'use client'` is mandatory for error.tsx** - React error boundaries use componentDidCatch and state, which are client-side features.

2. **error.digest** - An auto-generated hash that correlates client errors with server-side logs. Show it to users so they can report it to support.

3. **reset() behavior** - Attempts to re-render the route segment. Works well for transient errors but won't help if the underlying cause persists.

4. **Boundary hierarchy** - Errors bubble up until caught. A nested `error.tsx` prevents errors from reaching the root boundary.

5. **not-found.tsx vs error.tsx** - Different purposes. `not-found.tsx` handles expected "resource doesn't exist" cases. `error.tsx` handles unexpected runtime failures.

\*\*Side Quest: Set Up Error Monitoring with Vercel Observability\*\*

## Learn More

- [Error Handling](https://nextjs.org/docs/app/getting-started/error-handling) - Overview of error handling strategies
- [error.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/error) - File convention reference
- [not-found.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) - File convention reference
- [notFound()](https://nextjs.org/docs/app/api-reference/functions/not-found) - Function reference

## What's Next

You've built error boundaries that catch failures gracefully and let users recover. But what about the happy path? When data takes time to load, users see nothing until the entire page is ready. The next lesson covers loading states and streaming: showing instant feedback while content loads, and progressively revealing your UI as data becomes available.


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
