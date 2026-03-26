---
title: "Suspense and Streaming"
description: "Use Suspense boundaries and streaming to improve perceived performance and unblock UI earlier."
canonical_url: "https://vercel.com/academy/nextjs-foundations/suspense-and-streaming"
md_url: "https://vercel.com/academy/nextjs-foundations/suspense-and-streaming.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-16T19:36:46.560Z"
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

# Suspense and Streaming

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Suspense and Streaming

Your dashboard takes 4 seconds to load because one slow API blocks everything. Users stare at a blank screen, bounce, and never see the content that was ready in 200ms.

Traditional server rendering waits for ALL data before sending ANY HTML. Streaming flips this: send the shell immediately, let slow components trickle in as they resolve. Same total load time, completely different user experience.

\*\*Note: You've Already Used Suspense\*\*

In [Lesson 3.1: Cache Components](/03-advanced-patterns/cache-components), you wrapped async components in `<Suspense>` to create "dynamic holes" in static shells. This lesson dives deeper: how streaming works at the HTTP level, strategic boundary placement, and avoiding "spinner soup."

## Outcome

A page with component-level Suspense boundaries, minimal fallbacks, and streamed content. Shell renders instantly while slower sections stream in as ready.

## Fast Track

1. Use `loading.tsx` to wrap entire route segment in Suspense automatically.
2. Add component-level `<Suspense>` boundaries for granular progressive loading.
3. Keep fallbacks minimal and meaningful - avoid "spinner soup" with too many nested boundaries.

## Hands-On Exercise 3.3

The starter repo includes a profile page at `apps/web/src/app/profile/[id]/page.tsx` that already uses one Suspense boundary. Your task is to improve streaming granularity.

**Requirements:**

1. Add `loading.tsx` to `apps/web/src/app/profile/[id]/` for route-level streaming with skeleton fallback.
2. Split `ProfileContent` into separate async components: `ProfileHeader`, `ProfileStats`, `ProfileActivity`.
3. Wrap each component in its own Suspense boundary so they stream independently.
4. Keep fallbacks minimal and shaped like the actual content (skeleton loaders, not spinners).

**Implementation hints:**

- `loading.tsx` automatically wraps page in Suspense boundary.
- Component-level Suspense for granular control over streaming.
- Avoid deeply nested boundaries - creates confusing loading states.
- Fallbacks should match the shape of actual content (skeleton loaders).
- Test with slow 3G throttling in DevTools to verify streaming behavior.

````markdown title="Prompt: Plan Suspense Boundary Placement"
I'm implementing streaming with Suspense and need help deciding where to place boundaries.

<context>
Too many Suspense boundaries = "spinner soup" (confusing loading states)
Too few boundaries = lose streaming benefits (everything waits for slowest component)
Goal: 2-3 boundaries max, placed strategically
</context>

<my-page-structure>
**Components on this page:**

| Component | Data Source | Load Time | Above Fold? |
| --------- | ----------- | --------- | ----------- |
| _____     | _____       | _____ms   | Yes/No      |
| _____     | _____       | _____ms   | Yes/No      |
| _____     | _____       | _____ms   | Yes/No      |

Example:
| Component | Data Source | Load Time | Above Fold? |
|-----------|-------------|-----------|-------------|
| ProfileHeader | /api/user | 200ms | Yes |
| ProfileStats | /api/stats | 500ms | Yes |
| ActivityFeed | /api/activity | 800ms | No |
</my-page-structure>

<current-implementation>
```tsx
// My current page structure:
___PASTE_YOUR_PAGE_CODE___
```

Example:
```tsx
export default async function Page() {
  return (
    <main>
      <ProfileHeader />
      <ProfileStats />
      <ActivityFeed />
    </main>
  );
}
```
</current-implementation>

**Questions:**
1. How many Suspense boundaries should I use?
2. Should I group components or separate them?
3. Spinners or skeleton loaders for fallbacks?
4. Which components should stream first?

Generate a Suspense boundary strategy with:
- Component groupings
- Fallback components (prefer skeletons)
- Streaming order rationale
````

## Try It

1. **Test streaming behavior:**
   - Open page with DevTools Network tab throttled to "Slow 3G".
   - Shell and static content render immediately.
   - Suspense boundaries show fallbacks.
   - Content streams in as data becomes available.

2. **Verify perceived performance:**
   - Measure Time to First Byte (TTFB) - should be fast for shell.
   - Largest Contentful Paint (LCP) improves when above-fold content streams early.
   - No blocking on slow data fetching.

## Commit & Deploy

```bash
git add -A
git commit -m "feat(advanced): add suspense boundaries and streaming"
git push -u origin feat/advanced-suspense-streaming
```

## Done-When

- [ ] Open DevTools Network tab, throttle to "Slow 3G", reload page: see shell HTML arrive immediately (check waterfall)
- [ ] Page shows skeleton fallbacks while components load: `loading.tsx` skeleton visible before content appears
- [ ] After full page load, content streams in without full page re-render: each Suspense boundary resolves independently
- [ ] DevTools Performance tab recording shows multiple streaming chunks, not single blocking response
- [ ] No "spinner soup": maximum 2-3 skeleton loaders visible at once, not dozens of nested spinners

## Solution

Click to reveal solution

First, add a route-level loading fallback:

```typescript title="apps/web/src/app/profile/[id]/loading.tsx"
export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse p-8">
      <div className="mb-2 h-8 w-48 rounded bg-gray-200" />
      <div className="mb-6 h-4 w-32 rounded bg-gray-200" />
      <div className="mb-6 flex gap-4">
        <div className="h-6 w-20 rounded bg-gray-200" />
        <div className="h-6 w-20 rounded bg-gray-200" />
        <div className="h-6 w-20 rounded bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
      </div>
    </div>
  )
}
```

Then refactor the page to use component-level Suspense for granular streaming:

```typescript title="apps/web/src/app/profile/[id]/page.tsx"
import { Suspense } from 'react'

// Mock data fetching functions
async function fetchUserProfile(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return {
    id,
    name: 'Demo User',
    email: 'demo@example.com',
    joinedAt: new Date('2024-01-15'),
  }
}

async function fetchUserStats(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 400)) // Slower
  return { posts: 42, followers: 1234, following: 567 }
}

async function fetchUserActivity(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 600)) // Slowest
  return [
    { type: 'post', title: 'My first post', date: new Date() },
    { type: 'comment', title: 'Great article!', date: new Date() },
    { type: 'like', title: 'Liked a post', date: new Date() },
  ]
}

// Separate async components for independent streaming
async function ProfileHeader({ id }: { id: string }) {
  const profile = await fetchUserProfile(id)
  return (
    <section>
      <h1 className="font-bold text-2xl">{profile.name}</h1>
      <p className="text-gray-600">{profile.email}</p>
    </section>
  )
}

async function ProfileStats({ id }: { id: string }) {
  const stats = await fetchUserStats(id)
  return (
    <section className="flex gap-4">
      <div><strong>{stats.posts}</strong> posts</div>
      <div><strong>{stats.followers}</strong> followers</div>
      <div><strong>{stats.following}</strong> following</div>
    </section>
  )
}

async function ProfileActivity({ id }: { id: string }) {
  const activity = await fetchUserActivity(id)
  return (
    <section>
      <h2 className="mb-2 font-semibold text-xl">Recent Activity</h2>
      <ul className="space-y-2">
        {activity.map((item, i) => (
          <li key={i} className="text-gray-700">{item.title}</li>
        ))}
      </ul>
    </section>
  )
}

// Minimal skeleton fallbacks that match content shape
function HeaderSkeleton() {
  return (
    <section className="animate-pulse">
      <div className="mb-2 h-8 w-48 rounded bg-gray-200" />
      <div className="h-4 w-32 rounded bg-gray-200" />
    </section>
  )
}

function StatsSkeleton() {
  return (
    <section className="flex animate-pulse gap-4">
      <div className="h-6 w-20 rounded bg-gray-200" />
      <div className="h-6 w-20 rounded bg-gray-200" />
      <div className="h-6 w-20 rounded bg-gray-200" />
    </section>
  )
}

function ActivitySkeleton() {
  return (
    <section className="animate-pulse">
      <div className="mb-2 h-6 w-32 rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
      </div>
    </section>
  )
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      {/* Each section streams independently as it resolves */}
      <Suspense fallback={<HeaderSkeleton />}>
        <ProfileHeader id={id} />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <ProfileStats id={id} />
      </Suspense>

      <Suspense fallback={<ActivitySkeleton />}>
        <ProfileActivity id={id} />
      </Suspense>
    </main>
  )
}
```

\*\*Warning: Avoid Spinner Soup\*\*

**Too many nested Suspense boundaries create confusing loading states.** Keep boundaries shallow and strategic:

- ✅ 2-3 boundaries for independent slow sections
- ❌ Suspense around every component - creates "spinner soup"
- ✅ Fallbacks match content shape (skeleton loaders)
- ❌ Generic spinners everywhere

\*\*Note: Streaming Flow\*\*

**How streaming works:**

1. Shell HTML with static content sent immediately (fast TTFB)
2. Suspense boundaries replaced with fallbacks
3. Server continues rendering slow components
4. HTML chunks stream in as components complete
5. React hydrates and replaces fallbacks progressively

## References

- <https://nextjs.org/docs/app/getting-started/fetching-data>
- <https://nextjs.org/docs/app/api-reference/file-conventions/loading>
- <https://react.dev/reference/react/Suspense> - React Suspense documentation
- <https://react.dev/reference/react/lazy> - React lazy loading for code splitting


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
