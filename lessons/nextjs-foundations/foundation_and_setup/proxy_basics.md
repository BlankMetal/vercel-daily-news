---
title: "Proxy Basics"
description: "Create a proxy.ts file to intercept requests before they reach your routes. Add security headers, implement authentication redirects, and understand the request lifecycle in Next.js 16."
canonical_url: "https://vercel.com/academy/nextjs-foundations/proxy-basics"
md_url: "https://vercel.com/academy/nextjs-foundations/proxy-basics.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-09T23:38:40.319Z"
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

# Proxy Basics

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Proxy Basics

A user hits `/dashboard` without logging in. Your page component checks auth, realizes they're not authenticated, and redirects. But the damage is done: the page already started rendering, the database query already ran, and you've wasted server resources on an unauthorized request.

You need to intercept requests *before* they reach your routes. Check auth before rendering. Add security headers to every response. Log requests for debugging. Next.js 16 introduces `proxy.ts` for exactly this: one file, central control over your request pipeline.

## Outcome

A working `proxy.ts` that adds security headers to all responses, logs request information to the console, and demonstrates the request interception lifecycle.

## Fast Track

1. Create `apps/web/src/proxy.ts` exporting a `proxy` function that receives a `NextRequest`
2. Return `NextResponse.next()` with custom headers to continue to the route
3. Add a `config` export with `matcher` to scope which paths run the proxy

\*\*Warning: Next.js 16 Breaking Change\*\*

In Next.js 16, `proxy.ts` replaces the old `middleware.ts` convention. If you're upgrading from an earlier version, rename your file from `middleware.ts` to `proxy.ts` and change the exported function name from `middleware` to `proxy`. A codemod (an automated code transformation tool that updates your codebase to new patterns) is available: `npx @next/codemod@canary upgrade`.

## Building on Errors and Not Found

In [Errors and Not Found](/01-foundation-and-setup/errors-and-not-found), you added error boundaries that catch runtime errors and 404 pages for missing routes. Those handle problems *after* routing. Proxy handles logic *before* routing: authentication checks, header injection, request logging. Together they cover the full request lifecycle: intercept with proxy, render with routes, recover with error boundaries.

## Self-Paced Exercise

**Requirements:**

1. Create a proxy file that intercepts all page requests
2. Add `X-Frame-Options` and `X-Content-Type-Options` security headers
3. Log the request method and URL to the console
4. Configure the matcher to exclude static files and images

**Implementation hints:**

- `proxy.ts` must be in `src/` at the same level as `app/`, not inside the app directory
- Export a function named `proxy` (not `middleware`)
- Use `NextResponse.next()` to continue to the route with modified headers
- The `request` parameter provides `method`, `url`, `headers`, `cookies`
- Proxy runs after `next.config.js` redirects but before page rendering
- Proxy uses Node.js runtime by default and cannot be changed to Edge in this file
- Use the `config` export with `matcher` to control which paths run the proxy
- Exclude `_next/static`, `_next/image`, and `favicon.ico` from the matcher

## Step 1: Create the Proxy File

Create the proxy file at the correct location:

```bash
touch apps/web/src/proxy.ts
```

Add the proxy function with security headers:

```tsx title="apps/web/src/proxy.ts"
import { type NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // biome-ignore lint/suspicious/noConsole: Intentional for request logging demonstration
  console.log(`[Proxy] ${request.method} ${request.nextUrl.pathname}`)

  // Continue to the route with added security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  return response
}

// Configure which paths run the proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

Key points:

- The function is named `proxy`, not `middleware`
- `NextResponse.next()` continues to the route, allowing you to modify response headers
- The `matcher` regex excludes Next.js internal paths to avoid running on every static asset
- Console logging happens on the server, visible in your terminal running `pnpm dev`

## Step 2: Understand the Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Next.js Request Lifecycle                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. DNS + TLS                                                       │
│     │                                                               │
│  2. next.config.js redirects/rewrites                               │
│     │                                                               │
│  3. proxy.ts  ← YOU ARE HERE                                        │
│     │  • Check authentication                                       │
│     │  • Add/modify headers                                         │
│     │  • Log requests                                               │
│     │  • Redirect users                                             │
│     │                                                               │
│  4. Route matching (app/page.tsx, app/api/route.ts)                 │
│     │                                                               │
│  5. Page/Route rendering                                            │
│     │                                                               │
│  6. Response sent to client                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

Proxy runs on every matching request, including during prefetches. Keep it fast: no database queries, no heavy computation. Read cookies and headers, make routing decisions, continue quickly.

## Step 3: Add Request Headers for Downstream Routes

Proxy can also add headers that your routes can read. This is useful for passing context like user IDs or correlation IDs (unique identifiers that track a single request across multiple services for debugging):

```tsx title="apps/web/src/proxy.ts" {6-12,17-21}
import { type NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // biome-ignore lint/suspicious/noConsole: Intentional for request logging demonstration
  console.log(`[Proxy] ${request.method} ${request.nextUrl.pathname}`)

  // Create a request headers object with additional headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', crypto.randomUUID())
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  // Continue to route with modified request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Security headers on the response
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Request-Id', requestHeaders.get('x-request-id') || '')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

Now your route handlers and pages can read `x-request-id` from the incoming headers for logging or debugging.

## Step 4: Reading Headers in a Route

Create a simple API route to verify the proxy headers are being passed:

```bash
mkdir -p apps/web/src/app/api/debug
```

```tsx title="apps/web/src/app/api/debug/route.ts"
import { headers } from 'next/headers'

export async function GET() {
  const headersList = await headers()

  return Response.json({
    requestId: headersList.get('x-request-id'),
    pathname: headersList.get('x-pathname'),
    timestamp: new Date().toISOString(),
  })
}
```

## Try It

1. **Start the dev server:**
   ```bash
   pnpm dev
   ```

2. **Check proxy execution in terminal:**
   Navigate to `http://localhost:3000` and watch your terminal. You should see:
   ```
   [Proxy] GET /
   ```

3. **Verify security headers in browser:**
   Open DevTools → Network tab → click on the document request → Headers tab. Look for:
   ```
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   X-Request-Id: <uuid>
   ```

4. **Test the debug endpoint:**
   Navigate to `http://localhost:3000/api/debug`. You should see JSON with the request ID:
   ```json
   {
     "requestId": "550e8400-e29b-41d4-a716-446655440000",
     "pathname": "/api/debug",
     "timestamp": "2026-01-08T12:00:00.000Z"
   }
   ```

5. **Verify static files are excluded:**
   In the terminal, you should NOT see `[Proxy]` logs for paths like `/_next/static/*`. The matcher excludes these.

Expected terminal output:

```
┌ @repo/web#dev ─────────────────────────────────────────────────┐
│ ▲ Next.js 16.1.1 (Turbopack)                                   │
│ - Local:   http://localhost:3000                               │
│ ✓ Ready in 436ms                                               │
└────────────────────────────────────────────────────────────────┘
[Proxy] GET /
[Proxy] GET /api/debug
```

## Commit

```bash
git add -A
git commit -m "feat: add proxy with security headers and request logging"
git push
```

## Done-When

- [ ] `proxy.ts` exists at `apps/web/src/proxy.ts` (same level as `app/`)
- [ ] Browser DevTools shows `X-Frame-Options: DENY` header on page responses
- [ ] Browser DevTools shows `X-Content-Type-Options: nosniff` header on page responses
- [ ] Terminal shows `[Proxy] GET /` when visiting the homepage
- [ ] `http://localhost:3000/api/debug` returns JSON with a `requestId` value
- [ ] Static file requests (`_next/static/*`) do NOT trigger proxy logs

## Troubleshooting

Proxy not running at all

Check the file location. `proxy.ts` must be at `src/proxy.ts`, at the same level as the `app/` directory. It cannot be inside `app/`:

```
apps/web/src/
├── proxy.ts  ← Correct location
├── app/
│   └── page.tsx
```

Also verify the function is named `proxy`, not `middleware`:

```tsx
// Correct
export function proxy(request: NextRequest) { ... }

// Wrong (old convention)
export function middleware(request: NextRequest) { ... }
```

Headers not appearing on responses

Make sure you're returning the response from `NextResponse.next()`:

```tsx
const response = NextResponse.next()
response.headers.set('X-Frame-Options', 'DENY')
return response // Don't forget to return!
```

Also check the request isn't excluded by your matcher. The header won't appear on requests that don't match.

Proxy running on static files

Your matcher pattern isn't excluding static paths. Use this pattern:

```tsx
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

The `(?!...)` is a negative lookahead that excludes paths starting with those prefixes.

Type errors with NextRequest

Import types from `next/server`:

```tsx
import { type NextRequest, NextResponse } from 'next/server'
```

If you're seeing type errors about the function signature, ensure you're exporting the function (not a default export):

```tsx
// Correct
export function proxy(request: NextRequest) { ... }

// Wrong
export default function proxy(request: NextRequest) { ... }
```

\*\*Note: Still Stuck?\*\*

Ask your coding agent for help. Paste the error message and it can diagnose the issue.

````markdown title="Prompt: Debug Proxy Not Running"
My `proxy.ts` isn't executing in Next.js 16. I don't see my console.log statements.

**My proxy file:**
```tsx
// File location: _____
// Example: src/proxy.ts (must be at src root, not in app/)

___PASTE_YOUR_PROXY_TS___
```

**My next.config.ts (if using matcher):**
```tsx
___PASTE_RELEVANT_CONFIG___
```

**The route I'm testing:** /_____

**What I expect to happen:**
_____

**What actually happens:**
- [ ] No logs appear in terminal
- [ ] Page loads but proxy logic doesn't run
- [ ] Error message: _____

**Checklist:**
- [ ] proxy.ts is at `src/proxy.ts` (not `src/app/proxy.ts`)
- [ ] File exports a `proxy` function (not default export)
- [ ] Matcher pattern matches my test route
- [ ] Dev server was restarted after creating proxy.ts

Why isn't my proxy executing and how do I fix it?
````

## Solution

Complete implementation

### Proxy File

```tsx title="apps/web/src/proxy.ts"
import { type NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  // biome-ignore lint/suspicious/noConsole: Intentional for request logging demonstration
  console.log(`[Proxy] ${request.method} ${request.nextUrl.pathname}`)

  // Create request headers with additional context
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', crypto.randomUUID())
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  // Continue to route with modified request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Security headers on the response
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Request-Id', requestHeaders.get('x-request-id') || '')

  return response
}

// Only run proxy on page routes, not static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Debug API Route

```tsx title="apps/web/src/app/api/debug/route.ts"
import { headers } from 'next/headers'

export async function GET() {
  const headersList = await headers()

  return Response.json({
    requestId: headersList.get('x-request-id'),
    pathname: headersList.get('x-pathname'),
    timestamp: new Date().toISOString(),
  })
}
```

### Key Implementation Notes

1. **File location matters** - `proxy.ts` must be at the same level as `app/`, typically `src/proxy.ts` or just `proxy.ts` at project root.

2. **Function name is `proxy`** - This changed from `middleware` in Next.js 16. The old name still works but is deprecated.

3. **Node.js runtime only** - Unlike the old middleware.ts, you cannot configure Edge runtime in proxy files. This gives you full access to Node.js APIs.

4. **`NextResponse.next()` continues routing** - Call this to pass the request through with optional modifications. Without it, the request hangs.

5. **Matcher excludes static files** - The regex `(?!_next/static|_next/image|favicon.ico)` prevents proxy from running on every asset request, which would slow down your app.

6. **Request headers vs response headers** - Use `NextResponse.next({ request: { headers } })` to modify headers seen by your routes. Set `response.headers` for headers sent to the client.

\*\*Side Quest: Add Geolocation-Based Redirects\*\*

## Learn More

- [Proxy](https://nextjs.org/docs/app/getting-started/proxy) - Getting started guide
- [proxy.ts](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) - File convention reference
- [NextRequest](https://nextjs.org/docs/app/api-reference/functions/next-request) - Request object API
- [NextResponse](https://nextjs.org/docs/app/api-reference/functions/next-response) - Response object API

## What's Next

You've built request interception that runs before every page render. Security headers protect against common attacks. Request logging helps with debugging. The proxy pattern scales to authentication, A/B testing, geolocation routing, and more.

In Section 2, you'll dive into core Next.js features: data fetching patterns, caching strategies, and API routes. The proxy you built here will work alongside those features, intercepting requests before they reach your data-fetching code.


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
