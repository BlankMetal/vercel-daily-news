---
title: "Glossary"
description: "Reference guide for technical terms used throughout the Next.js Foundations course"
canonical_url: "https://vercel.com/academy/nextjs-foundations/glossary"
md_url: "https://vercel.com/academy/nextjs-foundations/glossary.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-09T23:31:48.910Z"
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

# Glossary

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Glossary

Quick reference for technical terms, acronyms, and concepts used in this course. Terms are organized by category for easy lookup.

***

## Performance Metrics

### Core Web Vitals

Google's three key metrics for measuring real-world user experience. These directly impact search ranking and are measured from actual Chrome users over a 28-day rolling window.

**First appears in:** [Core Web Vitals and Measurement](/03-advanced-patterns/06-core-web-vitals-and-measurement)

### LCP (Largest Contentful Paint)

The time it takes for the largest visible content element (image, video, or text block) to render. **Target: under 2.5 seconds.** LCP measures perceived load speed.

**First appears in:** [Core Web Vitals and Measurement](/03-advanced-patterns/06-core-web-vitals-and-measurement)

### CLS (Cumulative Layout Shift)

Measures visual stability: how much the page layout shifts unexpectedly during loading. Caused by images without dimensions, dynamically injected content, or web fonts loading. **Target: under 0.1.**

**First appears in:** [Core Web Vitals and Measurement](/03-advanced-patterns/06-core-web-vitals-and-measurement)

### INP (Interaction to Next Paint)

Measures responsiveness: the time from user interaction (click, tap, key press) to visual feedback. Replaced FID (First Input Delay) in March 2024. **Target: under 200ms.**

**First appears in:** [Core Web Vitals and Measurement](/03-advanced-patterns/06-core-web-vitals-and-measurement)

### TTFB (Time to First Byte)

Time from the browser requesting a page to receiving the first byte of the response. Affected by server processing time, network latency, and CDN configuration. **Target: under 800ms.**

**First appears in:** [Core Web Vitals and Measurement](/03-advanced-patterns/06-core-web-vitals-and-measurement)

### FCP (First Contentful Paint)

Time until the browser renders the first piece of DOM content (text, image, SVG). Indicates when users first see something happening. **Target: under 1.8 seconds.**

**First appears in:** [Third-Party Scripts](/04-polish-and-presentation/03-third-party-scripts)

### TTI (Time to Interactive)

Time until the page is fully interactive and responds reliably to user input. The main thread must be idle enough to handle input within 50ms.

**First appears in:** [Third-Party Scripts](/04-polish-and-presentation/03-third-party-scripts)

### TBT (Total Blocking Time)

Total time the main thread was blocked long enough to prevent input responsiveness, measured between FCP and TTI. Long tasks (over 50ms) contribute to TBT.

**First appears in:** [Third-Party Scripts](/04-polish-and-presentation/03-third-party-scripts)

### Lab Data vs Field Data

**Lab data**: Synthetic test results from tools like Lighthouse, run in controlled conditions. Useful for debugging but doesn't reflect real user experience.

**Field data**: Real User Monitoring (RUM) data collected from actual Chrome users. This is what Google uses for search ranking. Access via Chrome User Experience Report (CrUX).

**First appears in:** [Core Web Vitals and Measurement](/03-advanced-patterns/06-core-web-vitals-and-measurement)

***

## Rendering Strategies

### SSG (Static Site Generation)

Pre-rendering pages at **build time**. HTML is generated once and served from CDN. Best for content that doesn't change frequently (marketing pages, documentation, blog posts). Fastest possible response time.

**First appears in:** [Cache Components](/03-advanced-patterns/01-cache-components)
**Docs:** [Static Site Generation](https://nextjs.org/docs/pages/building-your-application/rendering/static-site-generation)

### SSR (Server-Side Rendering)

Rendering pages on **each request**. Server generates fresh HTML for every visitor. Best for personalized content, real-time data, or pages that must always be current. Higher server cost than SSG.

**First appears in:** [Cache Components](/03-advanced-patterns/01-cache-components)
**Docs:** [Server-Side Rendering](https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering)

### ISR (Incremental Static Regeneration)

Hybrid approach: serve static pages but **revalidate in the background** after a time interval. Combines SSG speed with fresher content. Set with `revalidate` option in fetch or route segment config.

**First appears in:** [Cache Components](/03-advanced-patterns/01-cache-components)
**Docs:** [Incremental Static Regeneration](https://nextjs.org/docs/app/guides/incremental-static-regeneration)

### CSR (Client-Side Rendering)

Rendering happens entirely in the **browser**. Server sends minimal HTML and JavaScript bundle. Best for highly interactive dashboards or apps behind authentication where SEO doesn't matter.

**First appears in:** [Cache Components](/03-advanced-patterns/01-cache-components)
**Docs:** [Client-Side Rendering](https://nextjs.org/docs/pages/building-your-application/rendering/client-side-rendering)

### PPR (Partial Prerendering)

Next.js 14+ feature combining static shell with dynamic content. The static parts render instantly from CDN while dynamic parts stream in. Enabled with `experimental.ppr` in next.config.

**First appears in:** [Cache Components](/03-advanced-patterns/01-cache-components)
**Docs:** [Cache Components](https://nextjs.org/docs/app/getting-started/cache-components)

### Hydration

React's process of attaching event handlers to server-rendered HTML, making it interactive. The browser receives HTML, then React "hydrates" it by connecting JavaScript functionality.

**First appears in:** [Server and Client Components](/01-foundation-and-setup/03-server-and-client-components)
**Docs:** [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### Hydration Mismatch

Error when server-rendered HTML doesn't match what React expects on the client. Common causes: using `Date.now()`, `Math.random()`, or browser-only APIs during render. Fix by using `useEffect` for client-only code.

**First appears in:** [Server and Client Components](/01-foundation-and-setup/03-server-and-client-components)
**Docs:** [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### RSC Payload

The serialized data format React Server Components use to send component output from server to client. Contains rendered UI and data, not raw HTML. Enables streaming and partial updates.

**First appears in:** [Cache Components](/03-advanced-patterns/01-cache-components)
**Docs:** [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

***

## Next.js Concepts

### App Router

Next.js 13+ routing system using the `app/` directory. File-system based routing where folders become URL segments. Supports layouts, loading states, error boundaries, and Server Components by default.

**First appears in:** [App Router Basics](/01-foundation-and-setup/02-app-router-basics)
**Docs:** [App Router](https://nextjs.org/docs/app)

### Server Components

React components that execute **only on the server**. Can directly access databases, file systems, and secrets. Never ship to the browser bundle. Default in App Router.

**First appears in:** [Server and Client Components](/01-foundation-and-setup/03-server-and-client-components)
**Docs:** [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### Client Components

Components that run in the **browser** (after initial server prerender). Required for interactivity: event handlers, hooks like `useState`, browser APIs. Mark with `"use client"` directive.

**First appears in:** [Server and Client Components](/01-foundation-and-setup/03-server-and-client-components)
**Docs:** [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### Error Boundary

React component that catches JavaScript errors in child components and displays fallback UI instead of crashing the whole app. In Next.js, create with `error.tsx` file.

**First appears in:** [Errors and Not Found](/01-foundation-and-setup/06-errors-and-not-found)
**Docs:** [error.js](https://nextjs.org/docs/app/api-reference/file-conventions/error)

### Suspense Boundary

React component that shows fallback content while children are loading. Enables streaming: shell renders immediately, content streams in as ready. Create with `<Suspense fallback={...}>`.

**First appears in:** [Suspense and Streaming](/03-advanced-patterns/03-suspense-and-streaming)
**Docs:** [loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading)

### Streaming

Sending HTML to the browser in chunks as it's generated, rather than waiting for the entire page. Improves TTFB and perceived performance. Enabled automatically with Suspense.

**First appears in:** [Suspense and Streaming](/03-advanced-patterns/03-suspense-and-streaming)
**Docs:** [loading.js](https://nextjs.org/docs/app/api-reference/file-conventions/loading)

### Middleware

Code that runs **before** a request is completed. Executes at the Edge, close to users. Use for authentication, redirects, headers, A/B testing. Lives in `middleware.ts` at project root.

**First appears in:** [Proxy Basics](/01-foundation-and-setup/07-proxy-basics)
**Docs:** [proxy.js](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)

### Route Groups

Folders wrapped in parentheses like `(marketing)` that organize routes without affecting URL structure. Useful for applying different layouts to route subsets.

**First appears in:** [App Router Basics](/01-foundation-and-setup/02-app-router-basics)
**Docs:** [Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)

### Dynamic Routes

Routes with variable segments using brackets: `[slug]` for single segment, `[...slug]` for catch-all, `[[...slug]]` for optional catch-all. Access values via `params` prop.

**First appears in:** [Dynamic Routing](/01-foundation-and-setup/04-dynamic-routing)
**Docs:** [Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)

### Intercepting Routes

Advanced pattern using `(.)`, `(..)`, or `(...)` prefixes to intercept navigation and show different content (like a modal) while preserving the URL. The intercepted route shows on hard refresh.

**First appears in:** [App Router Basics](/01-foundation-and-setup/02-app-router-basics)
**Docs:** [Intercepting Routes](https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes)

### generateStaticParams

Function that tells Next.js which dynamic route parameters to pre-render at build time. Returns array of param objects. Required for static generation of dynamic routes.

**First appears in:** [Dynamic Routing](/01-foundation-and-setup/04-dynamic-routing)
**Docs:** [generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)

### generateMetadata

Async function for dynamic page metadata (title, description, OpenGraph). Can fetch data and return metadata object. Runs on server, supports streaming.

**First appears in:** [Dynamic Metadata Done Right](/03-advanced-patterns/02-dynamic-metadata-done-right)
**Docs:** [generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

***

## Data Fetching

### Waterfall Pattern

Anti-pattern where data requests happen sequentially: each waits for the previous to complete. A page with three 400ms requests takes 1200ms total. Fix with parallel fetching.

**First appears in:** [Data Fetching Without Waterfalls](/02-core-features/05-data-fetching-without-waterfalls)

### Parallel Fetching

Initiating multiple data requests simultaneously using `Promise.all()` or multiple `await` statements started together. Three 400ms requests complete in 400ms total.

**First appears in:** [Data Fetching Without Waterfalls](/02-core-features/05-data-fetching-without-waterfalls)

### Request Deduplication

Next.js automatically deduplicates identical `fetch()` requests in a single render pass. Multiple components can request the same data without redundant network calls.

**First appears in:** [Data Fetching Without Waterfalls](/02-core-features/05-data-fetching-without-waterfalls)
**Docs:** [Caching](https://nextjs.org/docs/app/guides/caching)

### N+1 Query Problem

Database anti-pattern: fetching a list (1 query), then fetching related data for each item (N queries). Fix with JOINs, batch queries, or data loaders.

**First appears in:** [Query Performance Patterns](/04-polish-and-presentation/02-query-performance-patterns)

### stale-while-revalidate

Caching strategy: serve stale (cached) content immediately while fetching fresh content in the background. User sees instant response, cache updates for next request. Used in ISR and SWR.

**First appears in:** [Cache Components](/03-advanced-patterns/01-cache-components)
**Docs:** [Caching](https://nextjs.org/docs/app/guides/caching)

***

## Security

### CSP (Content Security Policy)

HTTP header that controls which resources the browser can load. Prevents XSS attacks by restricting script sources. Configure in middleware or next.config.

**Docs:** [Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy)

### DDoS (Distributed Denial of Service)

Attack that overwhelms a server with traffic from many sources. Mitigate with rate limiting, CDN protection, and services like Cloudflare or Vercel's built-in protection.

**First appears in:** [Security Review](/04-polish-and-presentation/01-security-review-apis-and-config)

### JWT (JSON Web Token)

Compact, URL-safe token for transmitting claims between parties. Contains encoded JSON with header, payload, and signature. Used for authentication and session management.

### Correlation ID

Unique identifier attached to a request that follows it through all services and logs. Essential for debugging distributed systems: trace a single user request across multiple services.

**First appears in:** [Proxy Basics](/01-foundation-and-setup/07-proxy-basics)

### Stack Trace

List of function calls active when an error occurred, showing the code path that led to the error. Never expose to users in production as it reveals internal code structure.

**First appears in:** [Security Review](/04-polish-and-presentation/01-security-review-apis-and-config)

### Secrets Manager

Service for securely storing and accessing sensitive credentials (API keys, database passwords). Examples: Vercel Environment Variables, AWS Secrets Manager, HashiCorp Vault.

**First appears in:** [Env and Security](/01-foundation-and-setup/05-env-and-security)

### Data Access Layer (DAL)

Architectural pattern that centralizes all database access in dedicated functions. Provides single point for authorization checks, query optimization, and data transformation.

**First appears in:** [Env and Security](/01-foundation-and-setup/05-env-and-security)

***

## Images & Fonts

### WebP

Modern image format developed by Google. 25-35% smaller than JPEG at equivalent quality. Supported by all modern browsers. Next.js Image component auto-converts to WebP.

**First appears in:** [Images with next/image](/03-advanced-patterns/04-images-next-image)
**Docs:** [Image Component](https://nextjs.org/docs/app/api-reference/components/image)

### AVIF

Newer image format based on AV1 video codec. 50% smaller than JPEG, better than WebP. Growing browser support. Next.js serves AVIF to supported browsers automatically.

**First appears in:** [Images with next/image](/03-advanced-patterns/04-images-next-image)
**Docs:** [Image Component](https://nextjs.org/docs/app/api-reference/components/image)

### srcset

HTML attribute that provides multiple image sources at different sizes. Browser picks the best one based on viewport and device pixel ratio. Next.js Image generates this automatically.

**First appears in:** [Images with next/image](/03-advanced-patterns/04-images-next-image)
**Docs:** [Image Component](https://nextjs.org/docs/app/api-reference/components/image)

### Art Direction

Serving different image crops or compositions based on viewport size. A wide landscape hero on desktop might become a square crop on mobile. Implement with `<picture>` element.

**First appears in:** [Image Polish](/04-polish-and-presentation/04-image-polish)

### Blur Placeholder

Low-quality image placeholder (LQIP) shown while the full image loads. Prevents layout shift and improves perceived performance. Next.js generates automatically with `placeholder="blur"`.

**First appears in:** [Image Polish](/04-polish-and-presentation/04-image-polish)
**Docs:** [Image Component](https://nextjs.org/docs/app/api-reference/components/image)

### FOIT (Flash of Invisible Text)

When text is invisible while a web font loads. Browser hides text until font is ready. Avoid with `font-display: swap` or `font-display: optional`.

**Docs:** [Font Component](https://nextjs.org/docs/app/api-reference/components/font)

### FOUT (Flash of Unstyled Text)

When text briefly shows in a fallback font before the web font loads. Less jarring than FOIT. Minimize with font preloading and `next/font`.

**Docs:** [Font Component](https://nextjs.org/docs/app/api-reference/components/font)

### Layout Shift

When visible elements move position after initial render. Common causes: images without dimensions, ads, dynamically injected content, web fonts. Measured by CLS metric.

**First appears in:** [Images with next/image](/03-advanced-patterns/04-images-next-image)
**Docs:** [Image Component](https://nextjs.org/docs/app/api-reference/components/image)

***

## SEO & Metadata

### SEO (Search Engine Optimization)

Practices to improve a website's visibility in search engine results. Includes technical factors (performance, crawlability), content quality, and metadata.

**First appears in:** [App Router Basics](/01-foundation-and-setup/02-app-router-basics)

### OpenGraph (OG) Tags

Metadata protocol for controlling how URLs appear when shared on social platforms. Defines title, description, image, and type. Set in `<meta property="og:*">` tags.

**First appears in:** [Dynamic Metadata Done Right](/03-advanced-patterns/02-dynamic-metadata-done-right)
**Docs:** [opengraph-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)

### Canonical URL

The "official" URL for a page when multiple URLs show the same content. Prevents duplicate content issues in search rankings. Set with `<link rel="canonical">`.

**First appears in:** [Dynamic Metadata Done Right](/03-advanced-patterns/02-dynamic-metadata-done-right)
**Docs:** [generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

### Twitter Cards

Twitter-specific metadata for rich link previews. Similar to OpenGraph but uses `twitter:*` meta tags. Supports summary, large image, and player card types.

**First appears in:** [Dynamic Metadata Done Right](/03-advanced-patterns/02-dynamic-metadata-done-right)
**Docs:** [generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

***

## Accessibility

### a11y

Numeronym for "accessibility" (a + 11 letters + y). Refers to making web content usable by people with disabilities, including screen reader users, keyboard-only users, and those with visual impairments.

**First appears in:** [Component Composition Patterns](/02-core-features/02-component-composition-patterns)

### ARIA (Accessible Rich Internet Applications)

Set of HTML attributes that provide additional semantics for assistive technologies. Examples: `aria-label`, `aria-hidden`, `aria-expanded`. Use when native HTML semantics are insufficient.

**First appears in:** [Component Composition Patterns](/02-core-features/02-component-composition-patterns)

### Focus Trap

Technique that constrains keyboard focus within a specific area, like a modal dialog. Prevents users from tabbing to elements behind the modal. Essential for accessible dialogs.

**First appears in:** [Component Composition Patterns](/02-core-features/02-component-composition-patterns)

***

## Development Tools

### Bundle

The JavaScript files generated by the build process, combining your code and dependencies. Smaller bundles = faster page loads. Server Components help reduce client bundle size.

**First appears in:** [Server and Client Components](/01-foundation-and-setup/03-server-and-client-components)

### Codemod

Automated code transformation tool that updates code patterns across a codebase. Next.js provides codemods for major version upgrades: `npx @next/codemod@latest`.

**First appears in:** [Proxy Basics](/01-foundation-and-setup/07-proxy-basics)
**Docs:** [Codemods](https://nextjs.org/docs/app/guides/upgrading/codemods)

### TUI (Terminal User Interface)

Text-based interface in the terminal. Turborepo's TUI shows real-time build output for all packages in a monorepo.

**First appears in:** [Project Setup](/01-foundation-and-setup/01-project-setup)

### HMR (Hot Module Replacement)

Development feature that updates code in the browser without full page reload. Preserves application state during development. Built into Next.js dev server.

**First appears in:** [Project Setup](/01-foundation-and-setup/01-project-setup)

### NODE\_ENV

Environment variable that indicates the runtime environment: `development`, `production`, or `test`. Next.js sets this automatically. Affects optimizations and error handling.

**First appears in:** [Env and Security](/01-foundation-and-setup/05-env-and-security)

***

## Architecture & Patterns

### API Layer

Centralized code that handles all data fetching and external service communication. In this course, the shared `packages/api/` directory provides type-safe data access functions used across the monorepo.

**First appears in:** [Project Setup](/01-foundation-and-setup/01-project-setup)

### Monorepo

A single repository containing multiple projects or packages. Enables code sharing, consistent tooling, and atomic commits across related projects. This course uses Turborepo to manage a monorepo with `apps/` and `packages/` directories.

**First appears in:** [Project Setup](/01-foundation-and-setup/01-project-setup)

### ORM (Object-Relational Mapping)

Library that maps database tables to programming language objects. Lets you query databases using code instead of raw SQL. Examples: Prisma, Drizzle, TypeORM.

**First appears in:** [Query Performance Patterns](/04-polish-and-presentation/02-query-performance-patterns)

### Database Index

Data structure that speeds up database queries by creating a sorted reference to table rows. Like a book index: instead of scanning every page, jump directly to relevant entries. Critical for query performance.

**First appears in:** [Query Performance Patterns](/04-polish-and-presentation/02-query-performance-patterns)

### Webhooks

HTTP callbacks that notify your application when events occur in external services. Instead of polling for changes, the external service POSTs data to your endpoint when something happens.

**First appears in:** [Query Performance Patterns](/04-polish-and-presentation/02-query-performance-patterns)

### Read-Your-Own-Writes

Database consistency guarantee that after writing data, subsequent reads from the same client see that write. Important for user experience: after saving a form, the user should see their changes immediately.

**First appears in:** [Query Performance Patterns](/04-polish-and-presentation/02-query-performance-patterns)

***

## Build & Optimization

### Client Bundle

The JavaScript files sent to the browser. Server Components reduce client bundle size by keeping server-only code off the bundle. Smaller bundles mean faster page loads and better performance.

**First appears in:** [Server and Client Components](/01-foundation-and-setup/03-server-and-client-components)

### Tree-Shaking

Build optimization that removes unused code from the final bundle. If you import one function from a library, tree-shaking eliminates the rest. Requires ES modules and proper exports.

**First appears in:** [Core Web Vitals and Measurement](/03-advanced-patterns/06-core-web-vitals-and-measurement)

### Code Splitting

Automatically dividing code into smaller chunks loaded on demand. Each route gets its own bundle. Users only download code for pages they visit. Built into Next.js.

**First appears in:** [Core Web Vitals and Measurement](/03-advanced-patterns/06-core-web-vitals-and-measurement)

### Inlined

Code or data embedded directly in the output rather than loaded separately. Environment variables prefixed with `NEXT_PUBLIC_` are inlined into the client bundle at build time.

**First appears in:** [Server and Client Components](/01-foundation-and-setup/03-server-and-client-components)

### Polyfills

Scripts that add modern JavaScript features to older browsers. If you use `Array.prototype.at()` and need IE11 support, a polyfill provides that method. Next.js handles common polyfills automatically.

**First appears in:** [Third-Party Scripts](/04-polish-and-presentation/03-third-party-scripts)

### Base64 Encoding

Text encoding that represents binary data as ASCII characters. Used for embedding small images directly in HTML/CSS (data URIs) or transmitting binary data in JSON. Blur placeholders use base64-encoded images.

**First appears in:** [Image Polish](/04-polish-and-presentation/04-image-polish)

***

## React Patterns

### Optimistic UI

Updating the UI immediately before server confirmation, assuming the action will succeed. If it fails, revert to previous state. Makes apps feel instant. Implement with `useOptimistic` hook.

**First appears in:** [Client-Server Boundaries](/02-core-features/01-client-server-boundaries)

### Progressive Enhancement

Building features that work without JavaScript, then enhancing with JS when available. Server Actions support this: forms submit via HTTP POST if JS fails, but use fetch when JS works.

**First appears in:** [Server Actions for Forms](/02-core-features/08-server-actions-for-forms)

### Polymorphic Components

Components that can render as different HTML elements. A `Button` component that renders as `<button>` or `<a>` based on props. Useful for design systems where visual style is consistent but semantics vary.

**First appears in:** [Component Composition Patterns](/02-core-features/02-component-composition-patterns)

### Slotting

Pattern where parent components provide "slots" for child content. In layouts, `children` is a slot. Parallel routes use named slots like `@modal`. Enables flexible composition.

**First appears in:** [Nested Layouts](/02-core-features/04-nested-layouts)
**Docs:** [Parallel Routes](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes)

### Spinner Soup

Anti-pattern of showing too many loading indicators simultaneously. Instead of one cohesive loading state, users see multiple spinners competing for attention. Fix with strategic Suspense boundary placement.

**First appears in:** [Suspense and Streaming](/03-advanced-patterns/03-suspense-and-streaming)

### Serializable

Data that can be converted to JSON and back without loss. Server Components can only pass serializable data to Client Components: strings, numbers, arrays, plain objects. Functions and class instances are not serializable.

**First appears in:** [Cache Components](/03-advanced-patterns/01-cache-components)
**Docs:** [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

***

## Validation & Types

### Zod

TypeScript-first schema validation library. Define a schema once, get runtime validation and TypeScript types. Used throughout this course for form validation and API input checking.

**First appears in:** [Server Actions for Forms](/02-core-features/08-server-actions-for-forms)

### Dynamic APIs

Next.js functions that make a route dynamic (rendered per-request): `cookies()`, `headers()`, `searchParams`, `connection()`. Using these opts out of static generation.

**First appears in:** [App Router Basics](/01-foundation-and-setup/02-app-router-basics)
**Docs:** [cookies](https://nextjs.org/docs/app/api-reference/functions/cookies), [headers](https://nextjs.org/docs/app/api-reference/functions/headers)

***

## Routing

### Catch-All Parameter

Dynamic route segment that captures multiple path segments. `[...slug]` matches `/a`, `/a/b`, `/a/b/c`. Access all segments as an array via `params.slug`.

**First appears in:** [Multi-App Routing](/02-core-features/09-multi-app-routing)
**Docs:** [Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)

### Negative Lookahead

Regex pattern `(?!...)` that matches only if the following characters don't match the pattern. Used in proxy.ts to exclude certain paths from rewrites.

**First appears in:** [Proxy Basics](/01-foundation-and-setup/07-proxy-basics)

***

## Monitoring

### RUM (Real User Monitoring)

Collecting performance data from actual users in production. Captures real-world conditions: slow networks, old devices, geographic latency. Contrast with synthetic/lab testing.

**First appears in:** [Third-Party Scripts](/04-polish-and-presentation/03-third-party-scripts)

***

## Other Terms

### Bandwidth

The amount of data that can be transferred over a network connection per unit of time. Limited bandwidth means slower downloads. Image optimization reduces bandwidth usage.

### API Minimization

Security principle of exposing only the data and functionality that's strictly necessary. Don't return entire database records when the client only needs two fields.

### Data Tainting (Experimental)

React experimental feature that marks sensitive data to prevent accidental exposure to client components. Helps catch security issues during development.

### Environment Variables (env vars)

Configuration values set outside your code, typically for secrets or environment-specific settings. Access via `process.env.VARIABLE_NAME`. Prefix with `NEXT_PUBLIC_` for client-side access.

**Docs:** [Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)

### FontFaceSet API

Browser API for detecting when fonts have loaded. Useful for avoiding layout shift or triggering animations after fonts are ready. Access via `document.fonts`.

***

## Cross-Reference Index

Quick lookup for where each term is first introduced in the course.

| Term                    | First Defined | Lesson                           |
| ----------------------- | ------------- | -------------------------------- |
| a11y                    | Section 02    | Component Composition Patterns   |
| API Layer               | Section 01    | Project Setup                    |
| App Router              | Section 01    | App Router Basics                |
| ARIA                    | Section 02    | Component Composition Patterns   |
| Art Direction           | Section 04    | Image Polish                     |
| AVIF                    | Section 03    | Images with next/image           |
| Base64 Encoding         | Section 04    | Image Polish                     |
| Blur Placeholder        | Section 04    | Image Polish                     |
| Bundle                  | Section 01    | Server and Client Components     |
| Cache Components        | Section 03    | Cache Components                 |
| Canonical URL           | Section 03    | Dynamic Metadata Done Right      |
| Catch-All Parameter     | Section 02    | Multi-App Routing                |
| Client Bundle           | Section 01    | Server and Client Components     |
| Client Components       | Section 01    | Server and Client Components     |
| CLS                     | Section 03    | Core Web Vitals and Measurement  |
| Code Splitting          | Section 03    | Core Web Vitals and Measurement  |
| Codemod                 | Section 01    | Proxy Basics                     |
| Core Web Vitals         | Section 03    | Core Web Vitals and Measurement  |
| Correlation ID          | Section 01    | Proxy Basics                     |
| CSR                     | Section 03    | Cache Components                 |
| Data Access Layer       | Section 01    | Env and Security                 |
| Database Index          | Section 04    | Query Performance Patterns       |
| DDoS                    | Section 04    | Security Review                  |
| Dynamic APIs            | Section 01    | App Router Basics                |
| Dynamic Routes          | Section 01    | Dynamic Routing                  |
| Error Boundary          | Section 01    | Errors and Not Found             |
| FCP                     | Section 04    | Third-Party Scripts              |
| Field Data              | Section 03    | Core Web Vitals and Measurement  |
| Focus Trap              | Section 02    | Component Composition Patterns   |
| generateMetadata        | Section 03    | Dynamic Metadata Done Right      |
| generateStaticParams    | Section 01    | Dynamic Routing                  |
| HMR                     | Section 01    | Project Setup                    |
| Hydration               | Section 01    | Server and Client Components     |
| Hydration Mismatch      | Section 01    | Server and Client Components     |
| Inlined                 | Section 01    | Server and Client Components     |
| INP                     | Section 03    | Core Web Vitals and Measurement  |
| Intercepting Routes     | Section 01    | App Router Basics                |
| ISR                     | Section 03    | Cache Components                 |
| Lab Data                | Section 03    | Core Web Vitals and Measurement  |
| Layout Shift            | Section 03    | Images with next/image           |
| LCP                     | Section 03    | Core Web Vitals and Measurement  |
| Middleware              | Section 01    | Proxy Basics                     |
| Monorepo                | Section 01    | Project Setup                    |
| N+1 Query Problem       | Section 04    | Query Performance Patterns       |
| Negative Lookahead      | Section 01    | Proxy Basics                     |
| NODE\_ENV               | Section 01    | Env and Security                 |
| OpenGraph               | Section 03    | Dynamic Metadata Done Right      |
| Optimistic UI           | Section 02    | Client-Server Boundaries         |
| ORM                     | Section 04    | Query Performance Patterns       |
| Parallel Fetching       | Section 02    | Data Fetching Without Waterfalls |
| Polyfills               | Section 04    | Third-Party Scripts              |
| Polymorphic Components  | Section 02    | Component Composition Patterns   |
| PPR                     | Section 03    | Cache Components                 |
| Progressive Enhancement | Section 02    | Server Actions for Forms         |
| Read-Your-Own-Writes    | Section 04    | Query Performance Patterns       |
| Request Deduplication   | Section 02    | Data Fetching Without Waterfalls |
| Route Groups            | Section 01    | App Router Basics                |
| RSC Payload             | Section 03    | Cache Components                 |
| RUM                     | Section 04    | Third-Party Scripts              |
| Secrets Manager         | Section 01    | Env and Security                 |
| SEO                     | Section 01    | App Router Basics                |
| Serializable            | Section 03    | Cache Components                 |
| Server Components       | Section 01    | Server and Client Components     |
| Slotting                | Section 02    | Nested Layouts                   |
| Spinner Soup            | Section 03    | Suspense and Streaming           |
| srcset                  | Section 03    | Images with next/image           |
| SSG                     | Section 03    | Cache Components                 |
| SSR                     | Section 03    | Cache Components                 |
| Stack Trace             | Section 04    | Security Review                  |
| stale-while-revalidate  | Section 03    | Cache Components                 |
| Streaming               | Section 03    | Suspense and Streaming           |
| Suspense Boundary       | Section 03    | Suspense and Streaming           |
| TBT                     | Section 04    | Third-Party Scripts              |
| Tree-Shaking            | Section 03    | Core Web Vitals and Measurement  |
| TTFB                    | Section 03    | Core Web Vitals and Measurement  |
| TTI                     | Section 04    | Third-Party Scripts              |
| TUI                     | Section 01    | Project Setup                    |
| Twitter Cards           | Section 03    | Dynamic Metadata Done Right      |
| Waterfall Pattern       | Section 02    | Data Fetching Without Waterfalls |
| WebP                    | Section 03    | Images with next/image           |
| Webhooks                | Section 04    | Query Performance Patterns       |
| Zod                     | Section 02    | Server Actions for Forms         |

***

## Related Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Web Vitals](https://web.dev/vitals/)
- [MDN Web Docs](https://developer.mozilla.org)


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
