---
title: "Not Found & Errors"
description: "Use `notFound()` and `not-found.tsx` for 404s and recenter error surfaces with `error.tsx` at the correct segment."
canonical_url: "https://vercel.com/academy/nextjs-foundations/not-found-and-error-surfaces"
md_url: "https://vercel.com/academy/nextjs-foundations/not-found-and-error-surfaces.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-10T00:08:05.442Z"
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

# Not Found & Errors

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Not Found & Errors

A user clicks a shared link to a blog post that was deleted last week. They see a blank screen. Or worse: a raw stack trace with your database connection string. Error handling isn't about catching exceptions—it's about what your users see when things go wrong.

Clear failure UIs prevent confusion and reduce support tickets. Error boundaries isolate failures and provide contextual recovery options.

## Outcome

A demo showing `notFound()` routing to the nearest `not-found.tsx` and nested error boundaries with recovery.

## Fast Track

1. Add `not-found.tsx` at root and nested segment.
2. Call `notFound()` in a page/data path.
3. Verify error surface precedence with nested `error.tsx`.

## Hands-On Exercise 2.3

Build error handling surfaces with proper boundary hierarchy.

**Requirements:**

1. Show 404 handling for missing slugs with `notFound()`.
2. Add a nested `error.tsx` boundary that overrides root.
3. Include a reset action on error boundary for recovery.
4. Add correlation IDs (unique identifiers for tracking requests across systems) for debugging.

**Implementation hints:**

- **notFound() function:** Triggers nearest `not-found.tsx` file up the tree, stops component rendering, sets HTTP 404 status.
- **Error boundary hierarchy:** Nearest `error.tsx` catches runtime errors, allows different error UIs for different sections.
- **Reset function:** Provides user recovery option to retry failed operation.
- **Debugging:** Include correlation IDs in error logs to trace issues.
- **Different error UIs:** Show contextual messages (e.g., "Dashboard Unavailable" vs generic "Application Error").
- Keep error boundary as a Client Component (must use `'use client'`).
- Return early with `notFound()` where appropriate (e.g., when blog post not found).
- Don't catch `notFound()` in try/catch blocks—it works by throwing an error.

\*\*Warning: Error Boundary Must Be Client Component\*\*

All error.tsx files must be Client Components. Add 'use client' at the top of the file.

\*\*Note: notFound() Behavior\*\*

notFound() stops execution immediately by throwing an error. Don't catch it in try/catch blocks or it won't trigger the not-found.tsx UI.

## Try It

- Navigate to a missing resource; confirm nearest not-found UI.

## Commit & Deploy

```bash
git add -A
git commit -m "feat(core): implement notFound() + nested error surfaces"
git push -u origin feat/core-notfound-error
```

## Done-When

- [ ] Navigate to `/posts/nonexistent-slug`: nested "Post Not Found" page appears (not generic 404)
- [ ] Navigate to `/random-nonexistent-page`: root "404" page appears
- [ ] Navigate to `/error-demo`, click "Trigger Error": nested error boundary with orange styling appears
- [ ] On error boundary, click "Try Again": page resets to initial state without page refresh
- [ ] On error boundary, verify "Correlation ID" is displayed for debugging

## Solution

Solution

\*\*Note: Demo Routes\*\*

We use `/posts` as a demo route in `apps/web` to practice error handling.
This is separate from the actual blog app (`apps/blog`) which has its own routes.

### File Structure

```
apps/web/src/app/
├── not-found.tsx              # Root 404 page (fallback)
├── error.tsx                  # Root error boundary
├── posts/
│   └── [slug]/
│       ├── page.tsx           # Uses notFound() for missing slugs
│       └── not-found.tsx      # Nested 404 (overrides root)
└── error-demo/
    ├── page.tsx               # Throws errors to test boundary
    └── error.tsx              # Nested error boundary with correlation ID
```

### Root 404 Page

```tsx title="apps/web/src/app/not-found.tsx"
// Root not-found.tsx - catches all 404s not handled by nested not-found files
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <h1 className="mb-4 font-bold text-4xl">404</h1>
      <p className="mb-4 text-gray-600">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
      >
        Go home
      </Link>
    </div>
  );
}
```

### Root Error Boundary

```tsx title="apps/web/src/app/error.tsx"
"use client";

// Root error boundary - catches all runtime errors not handled by nested boundaries
// Must be a Client Component: error boundaries use React state internally

import { useEffect } from "react";

// Rename to ErrorBoundary to avoid shadowing global Error
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: Error logging is intentional for debugging
    console.error("Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="mb-2 font-bold text-2xl text-red-800">
          Something went wrong
        </h2>
        <p className="mb-4 text-red-600">
          {error.message || "An unexpected error occurred"}
        </p>
        {/* digest is Next.js's auto-generated error ID for production - a unique hash that correlates client errors with server logs */}
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
  );
}
```

### Nested 404 for Posts

```tsx title="apps/web/src/app/posts/[slug]/not-found.tsx"
// Nested not-found.tsx - overrides root for /posts/[slug] routes
// Provides contextual messaging: "Post not found" instead of generic "Page not found"

import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <h1 className="mb-4 font-bold text-4xl">Post Not Found</h1>
      <p className="mb-4 text-gray-600">
        The blog post you&apos;re looking for doesn&apos;t exist.
      </p>
      <p className="mb-6 text-gray-500 text-sm">
        This is the nested not-found.tsx in /posts/[slug]/
      </p>
      <div className="flex gap-4">
        <Link
          href="/posts"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Browse Posts
        </Link>
        <Link
          href="/"
          className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
```

### Page Using notFound()

```tsx title="apps/web/src/app/posts/[slug]/page.tsx"
// Demonstrates notFound() routing to the nearest not-found.tsx

import { notFound } from "next/navigation";
import Link from "next/link";

// Simulated posts database
const posts: Record<string, { title: string; content: string }> = {
  "hello-world": {
    title: "Hello World",
    content: "This is the first post. Welcome to the blog!",
  },
  "nextjs-tips": {
    title: "Next.js Tips",
    content: "Here are some tips for building with Next.js...",
  },
};

// In Next.js 16, params is a Promise that must be awaited
export default async function PostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const post = posts[params.slug];

  // If post doesn't exist, trigger 404
  // notFound() throws - don't wrap in try/catch or it won't work
  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link
        href="/posts"
        className="mb-4 inline-block text-blue-600 hover:underline"
      >
        ← Back to posts
      </Link>
      <h1 className="mb-4 font-bold text-3xl">{post.title}</h1>
      <p className="text-gray-600">{post.content}</p>
    </main>
  );
}
```

### Nested Error Boundary with Correlation ID

```tsx title="apps/web/src/app/error-demo/error.tsx"
"use client";

// Nested error boundary with correlation ID for debugging
// Demonstrates: different error UI, correlation tracking, reset functionality

import { useEffect, useMemo } from "react";

// Generate a correlation ID for debugging
// In production, this helps trace errors across logs and support tickets
function generateCorrelationId(): string {
  return `err-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ErrorDemoBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Memoize so correlation ID stays stable during re-renders
  const correlationId = useMemo(() => generateCorrelationId(), []);

  useEffect(() => {
    // Log error with correlation ID for debugging
    // In production: send to Sentry, DataDog, or your error reporting service
    const errorLog = {
      correlationId,
      digest: error.digest,
      message: error.message,
      timestamp: new Date().toISOString(),
      location: "/error-demo",
    };
    // biome-ignore lint/suspicious/noConsole: Error logging is intentional
    console.error("Error demo boundary caught:", errorLog);
  }, [error, correlationId]);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-6">
        <h2 className="mb-2 font-bold text-orange-800 text-xl">
          Demo Error Caught!
        </h2>
        <p className="mb-4 text-orange-700">
          This error was caught by the nested error boundary in /error-demo.
        </p>
        <p className="mb-4 font-mono text-orange-600 text-sm">
          {error.message}
        </p>
        {/* Correlation ID: give to users for support tickets */}
        <p className="mb-4 font-mono text-orange-400 text-xs">
          Correlation ID: {correlationId}
        </p>
        {error.digest && (
          <p className="mb-4 font-mono text-orange-400 text-xs">
            Digest: {error.digest}
          </p>
        )}
        <div className="flex gap-3">
          {/* reset() re-renders the component tree, clearing the error state */}
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
  );
}
```

### Error Demo Page (triggers the boundary)

```tsx title="apps/web/src/app/error-demo/page.tsx"
"use client";

// Page that throws errors to test the nested error boundary
// Must be Client Component to use useState for triggering errors

import { useState } from "react";

export default function ErrorDemoPage() {
  const [shouldError, setShouldError] = useState(false);

  // Throwing during render triggers the nearest error.tsx
  if (shouldError) {
    throw new Error("This is a demo error triggered by the button!");
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 font-bold text-3xl">Error Boundary Demo</h1>
      <p className="mb-6 text-gray-600">
        Click the button to trigger an error and see the nested error boundary.
      </p>
      <button
        type="button"
        onClick={() => setShouldError(true)}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Trigger Error
      </button>
    </div>
  );
}
```

### Testing

1. **404 Test:** Visit `/posts/nonexistent-slug` → Should show "Post Not Found" (nested)
2. **404 Fallback:** Visit `/random-page` → Should show "404" (root)
3. **Error Test:** Visit `/error-demo` and click "Trigger Error" → Shows orange error UI
4. **Reset Test:** Click "Try Again" on error boundary → Page resets to initial state
5. **Correlation ID:** Check console for `correlationId` in error log

\*\*Side Quest: Implement Granular Error Recovery\*\*

## References

- <https://nextjs.org/docs/app/api-reference/file-conventions/not-found>
- <https://nextjs.org/docs/app/api-reference/functions/not-found>
- <https://nextjs.org/docs/app/api-reference/file-conventions/error>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
