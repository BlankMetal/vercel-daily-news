---
title: "Navigation"
description: "Use `next/link` for client-side transitions that preserve app state and avoid full reloads."
canonical_url: "https://vercel.com/academy/nextjs-foundations/navigation"
md_url: "https://vercel.com/academy/nextjs-foundations/navigation.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-13T21:52:21.192Z"
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

# Navigation

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Navigation

A user fills out half a form, clicks a nav link to check something, hits back—and their form data is gone. Full page reload. Or they're scrolled halfway down a list, navigate to a detail page, come back—scroll position reset to top. These aren't bugs in your code; they're the default behavior of plain `<a>` tags.

`next/link` enables **soft navigation**: client-side transitions that preserve state, maintain scroll position, and feel instant.

## Outcome

Meaningful links that soft-navigate and preserve state where needed.

## Fast Track

1. Replace plain anchors with `next/link` where appropriate.
2. Verify soft navigation behavior.
3. Handle focus management and accessibility.

## Hands-On Exercise 2.6

Implement soft navigation with proper state preservation.

**Requirements:**

1. Audit key navigations and swap to `next/link`.
2. Ensure focus lands meaningfully after navigation.
3. Confirm back/forward browser history behavior is intact.
4. Demonstrate both client-side (useRouter) and server-side (redirect) navigation.

**Key Concepts:**

- **Soft navigation:** Client-side route transitions without full page reload. The URL updates via JavaScript, only new page content is fetched, and shared layouts persist. State, scroll position, and interactivity are maintained.
- **Hard navigation:** Traditional full page load (triggered by plain `<a>` tags or external navigation). Clears application state, resets scroll position, and causes a full browser refresh.

**Implementation hints:**

- **next/link provides soft navigation:** No full page reloads, JavaScript updates URL, fetches only new page content, shared layouts persist.
- **Link behavior:** Prefetching, client-side transitions, preserves state across navigation.
- **Back button:** Browser navigation respects history; state is preserved.
- **useRouter (Client):** For programmatic soft navigation (`router.push()`, `router.back()`, `router.replace()`), user interactions, conditional navigation.
- **redirect() (Server):** For server-side navigation, authentication checks, form submissions after success.
- Avoid client boundaries when not needed.
- Keep link text accessible and descriptive.

\*\*Note: Client-Side vs Server-Side Navigation\*\*

Use useRouter from 'next/navigation' for client-side programmatic navigation (user interactions). Use redirect() from 'next/navigation' for server-side navigation (auth checks, Server Actions).

\*\*Note: Link vs Anchor Tag\*\*

Always prefer `<Link>` over `<a>` for internal navigation. Link provides soft navigation with fast client-side transitions, preserves component state, and enables prefetching. Plain anchors trigger hard navigation with full page reloads.

````markdown title="Prompt: Choose the Right Navigation Method"
I need to implement navigation in Next.js and want to choose the right approach.

<context>
Next.js offers multiple navigation methods:
- `<Link>` component - declarative, for user clicks
- `useRouter().push/replace` - programmatic, client-side
- `redirect()` - server-side, in Server Components/Actions
- `useRouter().back/forward` - history navigation
</context>

<my-scenario>
**What triggers the navigation:** _____
Example: "User clicks a button" or "Form submission succeeds" or "Auth check fails"

**Where the code runs:**

- [ ] Server Component
- [ ] Client Component
- [ ] Server Action
- [ ] Route Handler

**User experience requirements:**

- Should URL change? _____
- Should user be able to go back? _____
- Should form/scroll state be preserved? _____
- Must work without JavaScript? _____
</my-scenario>

<my-current-code>
```tsx
// What I'm trying to do:
___PASTE_YOUR_CODE_OR_DESCRIBE___
```
</my-current-code>

**Questions:**

1. Which navigation method fits my scenario?
2. What are the tradeoffs of each option?
3. What happens if I use the wrong method?

Recommend the right navigation method with a code example for my specific scenario.
````

\*\*Note: Optional: Generate with v0\*\*

Use v0 to scaffold a responsive nav bar and breadcrumb trail. Keep everything presentational; links must be real `<Link>` usages in our codebase, not hardcoded anchors from v0 output.

Prompt:

```text
Generate a responsive top navigation with logo primary links and a breadcrumb component using Tailwind presentational only no data fetching output semantic HTML and accessible focus management.
```

Open in v0: [Open in v0](https://v0.app?q=Generate%20a%20responsive%20top%20navigation%20with%20logo%20primary%20links%20and%20a%20breadcrumb%20component%20using%20Tailwind%20presentational%20only%20no%20data%20fetching%20output%20semantic%20HTML%20and%20accessible%20focus%20management.)

## Try It

- Navigate between listing and detail; confirm no full page reload.

## Commit & Deploy

```bash
git add -A
git commit -m "feat(core): implement soft navigation via next/link"
git push -u origin feat/core-next-link
```

## Done-When

- [ ] Navigate to `/nav-demo`, click "Go to Page A": URL changes to `/nav-demo/page-a` without page refresh (soft navigation)
- [ ] Click browser back button: returns to `/nav-demo` with state preserved
- [ ] Click "Hard nav to Page A": browser loading indicator appears (full page reload)
- [ ] On `/nav-demo`, click "router.push()": navigates programmatically without page refresh
- [ ] Click "router.replace()": navigates but back button skips the replaced entry
- [ ] Open DevTools Network tab during soft navigation: only RSC payload fetched (not full HTML)

## Solution

Solution

This solution demonstrates soft navigation with `next/link`, programmatic navigation with `useRouter`, and server-side navigation with `redirect()`.

### Step 1: Create the Navigation Demo Page

```tsx title="apps/web/src/app/nav-demo/page.tsx"
// Lesson 2.6: Navigation Semantics
// Demonstrates soft navigation with next/link and useRouter

import Link from "next/link";
import { connection } from "next/server";
import { NavigationButtons } from "./navigation-buttons";

export default async function NavDemoPage() {
  await connection(); // Opt out of prerendering - Date.now() needs request time
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 font-bold text-3xl">Navigation Demo</h1>

      <div className="space-y-6">
        {/* Link Component - Soft Navigation */}
        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">
            Soft Navigation with Link
          </h2>
          <p className="mb-4 text-gray-600">
            These links use next/link for client-side transitions. Notice how
            the page does not fully reload.
          </p>
          <nav className="flex gap-4">
            <Link
              href="/nav-demo/page-a"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Page A
            </Link>
            <Link
              href="/nav-demo/page-b"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Page B
            </Link>
          </nav>
        </section>

        {/* Hard Navigation Comparison */}
        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">
            Hard Navigation (Avoid)
          </h2>
          <p className="mb-4 text-gray-600">
            Plain anchor tags cause full page reloads. Notice the browser
            refresh indicator.
          </p>
          <nav className="flex gap-4">
            <a
              href="/nav-demo/page-a"
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Hard nav to Page A
            </a>
          </nav>
        </section>

        {/* Programmatic Navigation with useRouter */}
        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">
            Programmatic Navigation
          </h2>
          <p className="mb-4 text-gray-600">
            useRouter enables navigation from event handlers and conditional
            logic.
          </p>
          <NavigationButtons />
        </section>

        {/* State Preservation Demo */}
        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">State Preservation</h2>
          <p className="mb-4 text-gray-600">
            Navigate to child pages and back. The layout state is preserved
            during soft navigation.
          </p>
          <div className="rounded bg-gray-100 p-4">
            <p className="text-gray-500 text-sm">
              Current timestamp: {Date.now()}
            </p>
            <p className="text-gray-500 text-sm">
              (This updates on hard navigation but not soft navigation from
              child pages back)
            </p>
          </div>
        </section>
      </div>

      {/* Key concepts summary */}
      <div className="mt-8 rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-semibold">Key Concepts</h3>
        <ul className="list-inside list-disc space-y-1 text-gray-600 text-sm">
          <li>
            <strong>Soft navigation:</strong> Client-side transitions, preserves
            state
          </li>
          <li>
            <strong>Hard navigation:</strong> Full page reload, clears state
          </li>
          <li>
            <strong>Link component:</strong> Declarative soft navigation
          </li>
          <li>
            <strong>useRouter:</strong> Programmatic client-side navigation
          </li>
          <li>
            <strong>redirect():</strong> Server-side navigation (see below)
          </li>
        </ul>
      </div>
    </main>
  );
}
```

### Step 2: Create Client Component for Programmatic Navigation

```tsx title="apps/web/src/app/nav-demo/navigation-buttons.tsx"
"use client";

// Client component for programmatic navigation with useRouter
// Must be a Client Component because useRouter uses React hooks

import { useRouter } from "next/navigation";

export function NavigationButtons() {
  const router = useRouter();

  return (
    <div className="flex gap-4">
      {/* push: adds to history stack */}
      <button
        type="button"
        onClick={() => router.push("/nav-demo/page-a")}
        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        router.push()
      </button>

      {/* back: navigate to previous history entry */}
      <button
        type="button"
        onClick={() => router.back()}
        className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
      >
        router.back()
      </button>

      {/* replace: replaces current history entry (no back button) */}
      <button
        type="button"
        onClick={() => router.replace("/nav-demo/page-b")}
        className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
      >
        router.replace()
      </button>
    </div>
  );
}
```

### Step 3: Create Child Pages for Navigation Testing

```tsx title="apps/web/src/app/nav-demo/page-a/page.tsx"
import Link from "next/link";

export default function PageA() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 font-bold text-2xl">Page A</h1>
      <p className="mb-6 text-gray-600">
        You navigated here via soft navigation. The layout was preserved.
      </p>
      <nav className="flex gap-4">
        <Link
          href="/nav-demo"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Back to Demo
        </Link>
        <Link
          href="/nav-demo/page-b"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Page B
        </Link>
      </nav>
    </main>
  );
}
```

```tsx title="apps/web/src/app/nav-demo/page-b/page.tsx"
import Link from "next/link";

export default function PageB() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 font-bold text-2xl">Page B</h1>
      <p className="mb-6 text-gray-600">
        You navigated here via soft navigation. The layout was preserved.
      </p>
      <nav className="flex gap-4">
        <Link
          href="/nav-demo"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Back to Demo
        </Link>
        <Link
          href="/nav-demo/page-a"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Page A
        </Link>
      </nav>
    </main>
  );
}
```

### Step 4: Server-Side Navigation with redirect()

Use `redirect()` for server-side navigation, authentication checks, and after form submissions:

```tsx title="apps/web/src/app/protected/page.tsx"
// Server-side redirect for authentication
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function ProtectedPage() {
  const session = await getSession();

  // Redirect unauthenticated users to login
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 font-bold text-2xl">Protected Content</h1>
      <p>Welcome, {session.user.name}!</p>
    </main>
  );
}
```

\*\*Note: Demo Routes\*\*

We use `/posts` routes in `apps/web` to demonstrate navigation patterns. These demo routes are separate from the actual blog app (`apps/blog`) which has its own routing structure.

### Step 5: Redirect After Server Action (Form Submission)

```tsx title="apps/web/src/app/posts/new/actions.ts"
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // Save to database
  const post = await db.post.create({
    data: { title, content },
  });

  // Revalidate the posts list so it shows the new post
  revalidatePath("/posts");

  // Redirect to the newly created post
  // Server Actions use 303 status code by default
  redirect(`/posts/${post.slug}`);
}
```

```tsx title="apps/web/src/app/posts/new/page.tsx"
import { createPost } from "./actions";

export default function NewPostPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 font-bold text-2xl">Create New Post</h1>

      <form action={createPost} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="content" className="block font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            rows={5}
            required
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create Post
        </button>
      </form>
    </main>
  );
}
```

### Step 6: Conditional Redirect Based on Data

```tsx title="apps/web/src/app/users/[id]/page.tsx"
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

async function fetchUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  if (!res.ok) return null;
  return res.json();
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: PageProps) {
  const { id } = await params;
  const user = await fetchUser(id);

  // Redirect to login if user not found (auth scenario)
  if (!user) {
    redirect("/login");
  }

  // Alternative: show 404 for missing resources
  // if (!user) {
  //   notFound();
  // }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 font-bold text-2xl">{user.name}</h1>
      <p>{user.email}</p>
    </main>
  );
}
```

### Key Decisions Explained

1. **Link over anchor tags**: `<Link>` provides soft navigation (client-side transitions) that preserves state, enables prefetching, and feels faster. Plain `<a>` tags trigger hard navigation with full page reloads.

2. **useRouter for programmatic navigation**: When you need to navigate based on events or conditions (button clicks, form submissions, conditional logic), use `useRouter` in a Client Component.

3. **redirect() for server-side navigation**: Use `redirect()` in Server Components, Server Actions, and Route Handlers. Common uses include authentication checks and redirecting after mutations.

4. **type="button" on all buttons**: Biome requires explicit `type` attributes on buttons. Without it, buttons default to `type="submit"` which can cause unintended form submissions.

5. **router.replace vs router.push**: Use `replace` when you don't want users to navigate back (e.g., after login redirect). Use `push` for normal navigation where back button should work.

6. **revalidatePath before redirect**: When redirecting after a mutation, call `revalidatePath()` first to ensure the destination page shows fresh data.

\*\*Side Quest: Build a Breadcrumb Generator\*\*

## References

- <https://nextjs.org/docs/app/getting-started/linking-and-navigating>
- <https://nextjs.org/docs/app/api-reference/components/link>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
