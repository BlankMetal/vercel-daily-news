---
title: "Client‑Server Component Boundaries"
description: "Apply a simple decision model to pick Server or Client Components based on interactivity, browser APIs, data needs, and bundle impact."
canonical_url: "https://vercel.com/academy/nextjs-foundations/client-server-boundaries"
md_url: "https://vercel.com/academy/nextjs-foundations/client-server-boundaries.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-09T21:16:09.660Z"
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

# Client‑Server Component Boundaries

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Client‑Server Component Boundaries

Right boundary = smaller bundles (the JavaScript files sent to the browser), better security, faster loads. Wrong boundary = pain. Server Components execute only on the server and never ship to the browser. Client Components are prerendered to HTML on the server, then hydrate and become interactive in the browser.

## Outcome

A repeatable decision model with concrete examples in both apps.

\*\*Note: Working Directory\*\*

This lesson primarily uses `apps/web` to demonstrate client-server boundaries. You'll create two demo routes: `/demo/counter` (minimal client boundary) and `/demo/cards` (server children pattern). At the end, you'll apply the same pattern in `apps/blog` to show the monorepo consistency.

## Fast Track

1. Identify components that need hooks or browser APIs → mark `'use client'`.
2. Keep data fetching and heavy work in Server Components.
3. Pass server-rendered children into small client wrappers.

## Hands-On Exercise 2.1

Build components that demonstrate the decision model for Server vs Client Component boundaries.

**Requirements:**

1. Convert at least one UI to a small client wrapper consuming server-rendered children.
2. Document the decision for two components (why server vs client).
3. Ensure no secrets are accessed in client boundaries.
4. Show the performance impact of component choice (bundle size).

**Implementation hints:**

- **Decision model:** Server Components for data fetching, static content, database operations, heavy computations. Client Components for browser APIs, user interactions, React hooks, real-time features.
- **Performance implications:** Server Components reduce JavaScript bundle size; Client Components enable interactivity but increase bundle.
- **Anti-pattern:** Large Client Component boundaries force entire tree client-side, bloating bundle.
- **Pattern:** Extract small client wrappers (e.g., just the interactive button), keep rest as Server Components.
- Co-locate small client components; keep imports clean.
- Start with Server Components by default; only add `'use client'` when needed.

\*\*Note: Need Help Deciding Server vs Client?\*\*

Unsure whether a component should be a Server or Client Component? Use this prompt to analyze your component:

```markdown title="Prompt: Analyze Component for Server vs Client Boundary"
<context>
I'm building a Next.js application using App Router with Server and Client Components.
I have a component that I need to decide whether to make a Server Component (default) or Client Component ('use client').
</context>

<current-implementation>
[Paste your component code here]
</current-implementation>

<questions>
1. **Interactivity:** Does this component use React hooks (useState, useEffect, etc.) or event handlers (onClick, onChange)?
2. **Browser APIs:** Does it need access to window, localStorage, or other browser-only APIs?
3. **Data fetching:** Does it fetch data from a database or external API?
4. **Heavy dependencies:** Does it import large libraries that would bloat the client bundle?
5. **Secrets:** Does it access environment variables or API keys that must stay server-side?
6. **Children pattern:** Could I extract just the interactive parts into a small client wrapper and keep the rest as a Server Component?
</questions>

<specific-scenario>
Component purpose: [Describe what your component does]
Current dependencies: [List major imports]
Interactivity needs: [Describe user interactions]
Data requirements: [Describe data sources]
</specific-scenario>

Recommend whether this should be a Server or Client Component with rationale. If Client Component, suggest ways to minimize the client boundary by extracting Server Component children.
```

This analysis will help you make informed boundary decisions and optimize bundle size.

\*\*Warning: Bundle Size Impact\*\*

Marking a component with 'use client' includes all its dependencies in the browser bundle. Keep client boundaries small and specific to avoid shipping unnecessary JavaScript.

## Try It

- Interact with the client wrapper; confirm server children stream as expected.

## Commit & Deploy

```bash
git add -A
git commit -m "feat(core): add server/client boundary decisions with examples"
git push -u origin feat/core-boundaries
```

## Done-When

- [ ] Navigate to `/demo/counter` and click + button: counter increments without page reload
- [ ] Server timestamp on `/demo/counter` page does not change when clicking counter buttons
- [ ] Navigate to `/demo/cards` and click Collapse/Expand button: product cards toggle visibility without page reload
- [ ] Open DevTools Network tab on `/demo/counter`, click counter buttons: no network requests fire (client-side state only)
- [ ] View page source on `/demo/cards`: product card HTML is present (server-rendered, not client-injected)

## Solution

Solution

### Prerequisites

No additional dependencies required. The starter already includes everything needed.

### Step 1: Create a Counter Demo Page (Server Component)

This page demonstrates the boundary pattern: a Server Component page that renders server-side content alongside a small interactive client widget.

```tsx title="apps/web/src/app/demo/counter/page.tsx"
// No 'use client' - this is a Server Component by default
// Data fetching and heavy logic stays here on the server

import { Counter } from '@/components/counter'

// Simulated server-side data
async function getServerTimestamp(): Promise<string> {
  // This runs ONLY on the server
  return new Date().toISOString()
}

export default async function CounterDemoPage() {
  // Server-side data fetching (no JS shipped for this)
  const serverTimestamp = await getServerTimestamp()

  return (
    <main className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="font-bold text-3xl">Server/Client Boundary Demo</h1>
        <p className="mt-2 text-muted-foreground">
          This page is a Server Component. The counter below is a Client Component.
        </p>
      </div>

      {/* Server-rendered content (no JS) */}
      <section className="rounded-lg border bg-muted/50 p-6">
        <h2 className="font-semibold text-lg">Server-Rendered Content</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Generated at: <code className="font-mono text-xs">{serverTimestamp}</code>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          This content ships as HTML with zero JavaScript.
        </p>
      </section>

      {/* Client Component - interactive widget */}
      <section className="rounded-lg border bg-muted/50 p-6">
        <h2 className="font-semibold text-lg">Client Component (Interactive)</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Only this counter component ships JavaScript to the browser.
        </p>
        <Counter initialCount={0} />
      </section>

      {/* Decision documentation */}
      <section className="rounded-lg border bg-muted/50 p-6">
        <h2 className="font-semibold text-lg">Decision Rationale</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>
            <strong>Page (Server):</strong> Fetches data, renders static content, no interactivity needed
          </li>
          <li>
            <strong>Counter (Client):</strong> Uses useState hook, handles onClick events
          </li>
        </ul>
      </section>
    </main>
  )
}
```

### Step 2: Create the Counter Client Component

This is the minimal client boundary: only the interactive widget gets `'use client'`.

```tsx title="apps/web/src/components/counter.tsx"
'use client'

// Only import what's needed for this tiny component
import { useState } from 'react'

import { Button } from '@repo/ui/components/button'

interface CounterProps {
  initialCount: number
}

/**
 * A minimal client component demonstrating useState + onClick.
 * Only this component ships JavaScript to the browser.
 */
export function Counter({ initialCount }: CounterProps) {
  const [count, setCount] = useState(initialCount)

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => setCount((c) => c - 1)}
      >
        -
      </Button>
      <span className="min-w-[3ch] text-center font-mono text-2xl">{count}</span>
      <Button
        type="button"
        variant="outline"
        onClick={() => setCount((c) => c + 1)}
      >
        +
      </Button>
    </div>
  )
}
```

### Step 3: Create a Card List Demo (Server Children Pattern)

This demonstrates passing server-rendered children through a client wrapper.

```tsx title="apps/web/src/app/demo/cards/page.tsx"
// Server Component - fetches data, renders heavy content

import { ExpandableWrapper } from '@/components/expandable-wrapper'

// Simulated products from database
const products = [
  { id: '1', name: 'Widget Pro', description: 'Professional-grade widget', price: 99 },
  { id: '2', name: 'Gadget Plus', description: 'Enhanced gadget features', price: 149 },
  { id: '3', name: 'Tool Master', description: 'Master your workflow', price: 199 },
]

export default function CardsDemoPage() {
  return (
    <main className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="font-bold text-3xl">Server Children Pattern</h1>
        <p className="mt-2 text-muted-foreground">
          Heavy card content renders on server. Only the expand/collapse is client-side.
        </p>
      </div>

      {/* Client wrapper with server-rendered children */}
      <ExpandableWrapper title="Product Catalog">
        {/* These cards are Server Components - zero JS */}
        <div className="grid gap-4 md:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <h3 className="font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {product.description}
              </p>
              <p className="mt-2 font-mono text-lg">${product.price}</p>
            </div>
          ))}
        </div>
      </ExpandableWrapper>

      {/* Decision documentation */}
      <section className="rounded-lg border bg-muted/50 p-6">
        <h2 className="font-semibold text-lg">Decision Rationale</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>
            <strong>ExpandableWrapper (Client):</strong> Uses useState for expand/collapse toggle
          </li>
          <li>
            <strong>Product Cards (Server):</strong> Static content, no interactivity, rendered as HTML
          </li>
          <li>
            <strong>Pattern:</strong> Server children stream through client wrapper untouched
          </li>
        </ul>
      </section>
    </main>
  )
}
```

### Step 4: Create the Expandable Wrapper Client Component

A small client wrapper that accepts server-rendered children.

```tsx title="apps/web/src/components/expandable-wrapper.tsx"
'use client'

import { useState, type ReactNode } from 'react'

import { Button } from '@repo/ui/components/button'

interface ExpandableWrapperProps {
  children: ReactNode
  title: string
}

/**
 * A minimal client wrapper that shows/hides server-rendered content.
 * The children prop accepts Server Components that stream through unchanged.
 */
export function ExpandableWrapper({ children, title }: ExpandableWrapperProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">{title}</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
      {/* Server-rendered children passed through */}
      {isExpanded && <div className="mt-4">{children}</div>}
    </div>
  )
}
```

### Step 5: Add the Same Pattern to Blog App

\*\*Note: Switching to apps/blog\*\*

Now you'll implement the same boundary pattern in `apps/blog` to demonstrate **monorepo consistency**. The goal is to show that Next.js patterns work identically across multiple apps in your workspace. You're not building a blog-specific feature—you're proving the pattern is universal and reusable.

**Why both apps?** This lesson teaches a foundational pattern that applies everywhere. By implementing it in both `apps/web` and `apps/blog`, you learn that your component architecture decisions travel with you across any Next.js app in your monorepo.

Demonstrate the same boundary pattern works across apps in the monorepo.

```tsx title="apps/blog/src/app/demo/boundary/page.tsx"
// Server Component - demonstrates boundary pattern in blog app

import { Counter } from '@/components/counter'

export default function BoundaryDemoPage() {
  return (
    <main className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="font-bold text-3xl">Blog App: Boundary Demo</h1>
        <p className="mt-2 text-muted-foreground">
          Same pattern works across all apps in the monorepo.
        </p>
      </div>

      {/* Server-rendered content */}
      <section className="rounded-lg border bg-muted/50 p-6">
        <h2 className="font-semibold text-lg">Server Content</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This article preview renders server-side with zero JavaScript.
        </p>
      </section>

      {/* Client Component - reused from web app pattern */}
      <section className="rounded-lg border bg-muted/50 p-6">
        <h2 className="font-semibold text-lg">Interactive Widget</h2>
        <Counter initialCount={10} />
      </section>
    </main>
  )
}
```

```tsx title="apps/blog/src/components/counter.tsx"
'use client'

import { useState } from 'react'

import { Button } from '@repo/ui/components/button'

interface CounterProps {
  initialCount: number
}

export function Counter({ initialCount }: CounterProps) {
  const [count, setCount] = useState(initialCount)

  return (
    <div className="flex items-center gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => setCount((c) => c - 1)}
      >
        -
      </Button>
      <span className="min-w-[3ch] text-center font-mono text-2xl">{count}</span>
      <Button
        type="button"
        variant="outline"
        onClick={() => setCount((c) => c + 1)}
      >
        +
      </Button>
    </div>
  )
}
```

### File Structure

```
apps/
├── web/src/
│   ├── app/demo/
│   │   ├── counter/page.tsx    # Server Component with client widget
│   │   └── cards/page.tsx      # Server children through client wrapper
│   └── components/
│       ├── counter.tsx         # Client Component (useState, onClick)
│       └── expandable-wrapper.tsx  # Client wrapper for server children
└── blog/src/
    ├── app/demo/boundary/page.tsx  # Same pattern in blog app
    └── components/counter.tsx      # Duplicated for blog app
```

### Verification

1. **Visit `/demo/counter`** - Counter increments/decrements while timestamp stays static
2. **Visit `/demo/cards`** - Cards expand/collapse, heavy content renders server-side
3. **Check DevTools Network tab** - Only client components ship JavaScript
4. **Run `pnpm build`** - Compare bundle sizes between server and client components

### Decision Checklist Applied

| Component           | Decision | Reason                              |
| ------------------- | -------- | ----------------------------------- |
| `page.tsx` files    | Server   | Data fetching, static rendering     |
| `Counter`           | Client   | Uses `useState`, `onClick` handlers |
| `ExpandableWrapper` | Client   | Uses `useState` for toggle          |
| Product cards       | Server   | Static content, no interactivity    |

\*\*Side Quest: Build a Hybrid Data Dashboard\*\*

## References

- <https://nextjs.org/docs/app/getting-started/server-and-client-components>
- <https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer>
- <https://react.dev/reference/rsc/server-components> - React Server Components
- <https://react.dev/reference/rsc/use-client> - React 'use client' directive
- <https://react.dev/reference/react/useState> - React useState hook
- <https://react.dev/reference/react/useEffect> - React useEffect hook


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
