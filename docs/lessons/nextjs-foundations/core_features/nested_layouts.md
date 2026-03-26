---
title: "Nested Layouts"
description: "Implement nested `layout.tsx` files to provide section-specific chrome while keeping routing clean."
canonical_url: "https://vercel.com/academy/nextjs-foundations/nested-layouts"
md_url: "https://vercel.com/academy/nextjs-foundations/nested-layouts.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-10T23:43:21.253Z"
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

# Nested Layouts

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Nested Layouts

Your dashboard has a sidebar. Every page under `/dashboard/*` needs it. You copy-paste the sidebar into each page. Then the design changes. Now you're updating 12 files.

Nested layouts solve this: define the sidebar once, and every child route inherits it automatically. They persist across route changes and compose automatically.

## Outcome

A nested layout for a section that overrides root layout chrome.

## Fast Track

1. Add a section `layout.tsx` in a nested folder.
2. Move relevant chrome to the section layout.
3. Verify composition and slotting (how children are placed within layout wrappers).

## Hands-On Exercise 2.4

Build nested layouts that compose persistent UI across route segments.

**Requirements:**

1. Create a nested layout under a route group or segment.
2. Show different header/footer than root.
3. Keep child routing intact.
4. Demonstrate persistence across route changes within the section.

**Implementation hints:**

- **layout.tsx in each segment:** Creates nested composition automatically.
- **Layouts persist:** Don't re-render when navigating between child routes.
- **Automatic deduplication:** Next.js ensures layouts only render once per navigation.
- **Children prop pattern:** Layout receives `children` and wraps it with section-specific UI.
- **Layouts with params:** If your layout needs params (rare but possible), remember params are async Promises. Layout must be async and await params.
- Avoid duplicating providers if not needed.
- Keep the layout lean; minimize data fetching here.

\*\*Note: Layout Persistence\*\*

Layouts persist across route changes within their segment. State is maintained when navigating between child pages, improving performance and user experience.

## Try It

- Navigate within the section; verify persistent chrome.

## Commit & Deploy

```bash
git add -A
git commit -m "feat(core): add nested layout for section chrome"
git push -u origin feat/core-nested-layout
```

## Done-When

- [ ] Navigate from `/dashboard` to `/dashboard/analytics`: sidebar remains visible and does not flash/reload
- [ ] Navigate from `/dashboard/analytics` to `/dashboard/settings`: sidebar remains visible (verify by watching for any flicker)
- [ ] Navigate from `/` to `/about`: marketing header/footer persists without reload
- [ ] Compare `/` (marketing) vs `/dashboard`: different chrome visible (header/footer vs sidebar)
- [ ] Visit `/about` (not `/marketing/about`): route group does not add segment to URL
- [ ] Open DevTools Network tab, navigate between dashboard pages: layout.tsx JavaScript does not re-fetch

## Solution

Solution

### File Structure

```
apps/web/src/app/
├── layout.tsx                 # Root layout (html, body, global providers)
├── (marketing)/
│   ├── layout.tsx             # Marketing layout (header, footer, nav)
│   ├── page.tsx               # Home page
│   ├── about/page.tsx
│   └── pricing/page.tsx
└── dashboard/
    ├── layout.tsx             # Dashboard layout (sidebar, different chrome)
    ├── page.tsx               # Dashboard overview
    ├── analytics/page.tsx
    └── settings/page.tsx
```

### How Layout Composition Works

```
┌─────────────────────────────────────────────────────────────┐
│  Root Layout (layout.tsx)                                   │
│  ├── <html>, <body>, global providers                       │
│  │                                                          │
│  │  ┌─────────────────────────────────────────────────────┐│
│  │  │  Marketing Layout ((marketing)/layout.tsx)          ││
│  │  │  ├── Header with nav                                ││
│  │  │  ├── {children} ← Page content renders here         ││
│  │  │  └── Footer                                         ││
│  │  └─────────────────────────────────────────────────────┘│
│  │                                                          │
│  │  ┌─────────────────────────────────────────────────────┐│
│  │  │  Dashboard Layout (dashboard/layout.tsx)            ││
│  │  │  ├── Sidebar (persists across routes)               ││
│  │  │  └── {children} ← Page content renders here         ││
│  │  └─────────────────────────────────────────────────────┘│
│  │                                                          │
└─────────────────────────────────────────────────────────────┘
```

### Root Layout

```tsx title="apps/web/src/app/layout.tsx"
// Root layout: wraps ALL pages, provides html/body structure
// Keep this minimal: no section-specific chrome here

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js Foundations",
  description: "Learning Next.js patterns",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        {/* Global providers would go here (theme, auth, etc.) */}
        {children}
      </body>
    </html>
  );
}
```

### Marketing Layout (Route Group)

```tsx title="apps/web/src/app/(marketing)/layout.tsx"
// Marketing section layout: header, footer, nav
// (marketing) is a route group - doesn't affect URL structure
// Routes: /, /about, /pricing (NOT /marketing/about)

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Marketing header - persists across all marketing pages */}
      <header className="mb-8 border-b py-4">
        <nav className="mx-auto flex max-w-4xl gap-4 px-4">
          <a href="/" className="font-semibold">
            Home
          </a>
          <a href="/about" className="text-gray-600 hover:text-gray-900">
            About
          </a>
          <a href="/pricing" className="text-gray-600 hover:text-gray-900">
            Pricing
          </a>
          {/* Link to dashboard (different layout) */}
          <a
            href="/dashboard"
            className="ml-auto text-blue-600 hover:text-blue-800"
          >
            Dashboard →
          </a>
        </nav>
      </header>

      {/* Page content renders here */}
      <main className="mx-auto max-w-4xl px-4">{children}</main>

      {/* Marketing footer - persists across all marketing pages */}
      <footer className="mx-auto mt-8 max-w-4xl border-t px-4 py-4 text-gray-500 text-sm">
        © 2026 Next.js Foundations
      </footer>
    </div>
  );
}
```

### Dashboard Layout (Nested Segment)

```tsx title="apps/web/src/app/dashboard/layout.tsx"
// Dashboard layout: sidebar navigation, different chrome than marketing
// This layout PERSISTS when navigating between /dashboard/* routes
// The sidebar doesn't re-render - only the main content area changes

import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - persists across all dashboard routes */}
      <aside className="w-64 border-r bg-gray-50 p-4">
        <h2 className="mb-4 font-bold text-lg">Dashboard</h2>
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-200"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/analytics"
            className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-200"
          >
            Analytics
          </Link>
          <Link
            href="/dashboard/settings"
            className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-200"
          >
            Settings
          </Link>
        </nav>
        <div className="mt-8 border-t pt-4">
          {/* Link back to marketing section */}
          <Link
            href="/"
            className="text-gray-500 text-sm hover:text-gray-700"
          >
            ← Back to site
          </Link>
        </div>
        <div className="mt-4">
          <p className="text-gray-400 text-xs">
            This sidebar persists when navigating between dashboard pages.
          </p>
        </div>
      </aside>

      {/* Main content area - children change on navigation */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

### Dashboard Pages

```tsx title="apps/web/src/app/dashboard/page.tsx"
// Dashboard overview page
// When navigating here from /dashboard/analytics, only this component re-renders
// The sidebar layout persists (no flicker, state preserved)

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-4 font-bold text-3xl">Dashboard Overview</h1>
      <p className="mb-6 text-gray-600">
        Welcome to your dashboard. Navigate between pages using the sidebar.
        Notice how the sidebar persists across route changes.
      </p>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-800">Users</h3>
          <p className="font-bold text-2xl text-blue-600">1,234</p>
        </div>
        <div className="rounded-lg border bg-green-50 p-4">
          <h3 className="font-semibold text-green-800">Revenue</h3>
          <p className="font-bold text-2xl text-green-600">$45,678</p>
        </div>
        <div className="rounded-lg border bg-purple-50 p-4">
          <h3 className="font-semibold text-purple-800">Orders</h3>
          <p className="font-bold text-2xl text-purple-600">567</p>
        </div>
      </div>
    </div>
  );
}
```

```tsx title="apps/web/src/app/dashboard/analytics/page.tsx"
// Analytics page - demonstrates layout persistence
// Try adding console.log in the layout to verify it doesn't re-run

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="mb-4 font-bold text-3xl">Analytics</h1>
      <p className="mb-6 text-gray-600">
        This is the analytics page. The sidebar layout persisted during
        navigation.
      </p>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 font-semibold text-xl">Traffic Overview</h2>
        <div className="flex h-64 items-center justify-center rounded bg-gray-100">
          <span className="text-gray-400">[Chart placeholder]</span>
        </div>
      </div>
    </div>
  );
}
```

```tsx title="apps/web/src/app/dashboard/settings/page.tsx"
// Settings page - form state would persist across sibling navigations
// If you had a form here with unsaved changes, navigating to /analytics
// and back would preserve those changes (because the layout persists)

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-4 font-bold text-3xl">Settings</h1>
      <p className="mb-6 text-gray-600">
        Configure your dashboard settings. The sidebar persists during
        navigation.
      </p>

      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Notifications</h2>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span>Email notifications</span>
          </label>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Theme</h2>
          <select className="rounded border px-3 py-2">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

### Testing Layout Persistence

1. **Navigate Dashboard:** Click between Overview → Analytics → Settings
2. **Watch Network Tab:** Layout CSS/JS doesn't reload between dashboard pages
3. **Add State Test:** Add a counter to the sidebar, verify it persists across navigation
4. **Compare Layouts:** Visit `/` (marketing) vs `/dashboard` to see different chrome
5. **Route Group:** Confirm `/about` works (NOT `/marketing/about`)

### Key Patterns

- **Route Groups:** `(marketing)` folder organizes files without affecting URLs
- **Segment Layouts:** `dashboard/layout.tsx` applies to all `/dashboard/*` routes
- **Persistence:** Layouts don't re-render on child navigation (state preserved)
- **No Provider Duplication:** Put providers in root layout, not every nested layout

\*\*Side Quest: Build a Multi-Tenant Layout System\*\*

## References

- <https://nextjs.org/docs/app/getting-started/layouts-and-pages>
- <https://nextjs.org/docs/app/api-reference/file-conventions/layout>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
