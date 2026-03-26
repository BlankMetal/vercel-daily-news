---
title: "Data Fetching Without Waterfalls"
description: "Replace sequential awaits with concurrent fetching patterns to reduce latency."
canonical_url: "https://vercel.com/academy/nextjs-foundations/data-fetching-without-waterfalls"
md_url: "https://vercel.com/academy/nextjs-foundations/data-fetching-without-waterfalls.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-13T21:24:54.467Z"
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

# Data Fetching Without Waterfalls

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Data Fetching Without Waterfalls

Waterfalls (sequential data fetches where each request waits for the previous one to complete) kill performance. Sequential awaits can make pages extremely slow. Parallelize to cut p95 latency (the threshold that 95% of your users experience or better) and stabilize UX.

## Outcome

Endpoints/pages that fetch multiple sources concurrently with clear ownership.

## Fast Track

1. Identify sequential awaits.
2. Refactor to `Promise.all()` or equivalent concurrency.
3. Handle errors gracefully with `Promise.allSettled()` when appropriate.

\*\*Warning: Spotting Performance Waterfalls\*\*

Not sure if your code has async waterfall issues? Use this prompt to analyze your data fetching:

```markdown title="Prompt: Identify Async Waterfall Performance Issues"
<context>
I'm building a Next.js application with multiple data sources (database queries, API calls, etc.).
I want to identify if my current implementation has async waterfall performance issues where requests wait unnecessarily.
</context>

<current-implementation>
[Paste your page component or route handler code that fetches data]
</current-implementation>

<questions>
1. **Sequential vs Parallel:** Are any of my awaits running sequentially when they could run in parallel?
2. **Dependencies:** Which data fetches actually depend on each other vs which are independent?
3. **Performance impact:** What's the estimated time cost of my current waterfall (add up sequential request times)?
4. **Potential improvement:** What would the time cost be if I ran independent requests in parallel?
5. **Error handling:** What should happen if one fetch fails? Can the page render with partial data?
</questions>

<specific-scenario>
Data sources being fetched:
1. [Describe first data source and typical response time]
2. [Describe second data source and typical response time]
3. [Describe third data source and typical response time]

Current user experience: [Describe loading time or symptoms]
</specific-scenario>

Analyze my code for async waterfall issues. Identify which fetches are independent and could run in parallel. Calculate the potential performance improvement (sequential time vs parallel time). Recommend error handling strategies for partial failures.
```

This analysis will reveal performance bottlenecks and quantify potential improvements.

## Hands-On Exercise 2.5

Eliminate async waterfalls with parallel data fetching.

**Requirements:**

1. Refactor a page loading two+ resources sequentially into parallel fetches.
2. Show a before/after timing comparison in logs (document the improvement).
3. Ensure error aggregation is handled sanely.
4. Handle partial failures gracefully using `Promise.allSettled()` when appropriate.

\*\*Note: New to Promise.all?\*\*

`Promise.all()` takes an array of promises and waits for all of them to resolve simultaneously. The results come back in the same order as the input array, which lets you destructure them cleanly:

```ts
const [user, posts, stats] = await Promise.all([
  fetchUser(),   // Returns first
  fetchPosts(),  // Returns second
  fetchStats(),  // Returns third
]);
```

Order is guaranteed: `user` always gets the result of `fetchUser()`, regardless of which fetch finishes first.

**Implementation hints:**

- **Sequential awaits kill performance:** Three 200ms requests sequentially = 600ms total. Same requests with `Promise.all()` = 200ms total (runs in parallel).
- **Async params/searchParams:** Remember to await params and searchParams before using them in fetches. Include them in your `Promise.all()` for optimal performance.
- **Use Promise.all():** Fetch multiple data sources simultaneously for dramatic loading time reduction.
- **Keep fetches independent:** Maximize overlap by ensuring requests don't depend on each other.
- **Parallel pattern with params:** `const [{ slug }, userData, posts] = await Promise.all([params, fetchUser(), fetchPosts()])` - await params alongside your data fetches.
- **Partial failures:** Use `Promise.allSettled()` when some data is optional and the page can render without it.
- **Error aggregation:** Handle failures gracefully without masking root cause.
- Better user experience with faster page loads.

\*\*Note: Ready to Parallelize?\*\*

Have sequential fetches ready to convert? Use this prompt for the refactor:

```markdown title="Prompt: Convert Sequential Fetches to Promise.all()"
<context>
I'm refactoring a Next.js page or route handler that currently fetches data sequentially.
I've identified independent data sources that can be fetched in parallel using Promise.all().
</context>

<current-implementation>
[Paste your current sequential fetch code]

Example (sequential):
    const user = await fetchUser(id);
    const posts = await fetchPosts(userId);
    const comments = await fetchComments(userId);
    // Sequential: 200ms + 300ms + 250ms = 750ms total

Example (with params):
    export default async function Page({ params }: { params: Promise<{ id: string }> }) {
      const { id } = await params;  // Must await params first
      const user = await fetchUser(id);  // Then fetch user
      const posts = await fetchPosts(id);  // Then fetch posts
      // Sequential: params + 200ms + 300ms = even worse!
    }
</current-implementation>

<questions>
1. **Promise.all() syntax:** How do I convert these sequential awaits to Promise.all()? Should I include params in the Promise.all()?
2. **Destructuring:** What's the cleanest way to destructure the results (including params)?
3. **Error handling:** How do I handle errors when one fetch fails but others succeed?
4. **Partial failures:** Should I use Promise.allSettled() instead for resilient error handling?
5. **TypeScript types:** How do I properly type the Promise.all() return value with async params?
6. **Performance measurement:** How can I verify the performance improvement with timing logs?
</questions>

<specific-scenario>
Data sources:
1. [First fetch - describe and estimate time]
2. [Second fetch - describe and estimate time]
3. [Third fetch - describe and estimate time]

Dependencies: [List which fetches depend on others, if any]
Error handling needs: [Describe what should happen if one fetch fails]
</specific-scenario>

Provide the refactored code using Promise.all() with proper error handling, TypeScript types, and timing logs to measure improvement. Explain when to use Promise.all() vs Promise.allSettled() and how to handle partial failures gracefully.
```

This will give you production-ready parallel fetch code with proper error handling.

\*\*Note: Performance Killer\*\*

Sequential data fetching is a common performance killer. Always use Promise.all() to fetch independent data sources in parallel. The performance difference can be dramatic: 1800ms → 800ms or better.

\*\*Note: Why Promise.all() Matters\*\*

Promise.all() runs fetches simultaneously instead of waiting for each to complete. This is essential for production applications and dramatically reduces total loading time.

## Parallel Fetching and Caching

Parallel fetching is a prerequisite for effective caching. When you combine both patterns, you get the best of both worlds:

| Strategy             | When to Use                      |
| -------------------- | -------------------------------- |
| **Parallel only**    | All fetches are fast (`<100ms`)  |
| **Cache only**       | Single expensive fetch           |
| **Parallel + Cache** | Multiple fetches, some expensive |

```typescript
// Parallel + Cache: Best of both worlds
const [product, reviews, recommendations] = await Promise.all([
  getProduct(id),        // Cached (expensive)
  getReviews(id),        // Fresh (user-generated)
  getRecommendations(id) // Cached (expensive)
])
```

**Why parallel matters for caching:**

- Cached fetches return instantly from cache
- Fresh fetches run in parallel, not blocked by cached ones
- Total time = max(cached, fresh), not sum of all

\*\*Note: Preview: Cache Components\*\*

You'll learn to add `"use cache"` to functions in [Lesson 3.1: Cache Components](/03-advanced-patterns/cache-components). For now, just know that caching and parallel fetching work together: cache the expensive operations, parallelize the rest.

## Try It

- Measure response time before and after (terminal timing/logs).

## Commit & Deploy

```bash
git add -A
git commit -m "feat(core): eliminate async waterfalls with parallel fetches"
git push -u origin feat/core-parallel-fetch
```

## Done-When

- [ ] Navigate to `/data-demo`: page shows "Parallel fetch completed in \~XXXms" banner
- [ ] Verify timing shows \~300ms (not \~750ms that sequential would take)
- [ ] Code review: page uses `Promise.all()` to fetch user, posts, and stats simultaneously
- [ ] Console logs (or server terminal) show no sequential await patterns for independent data

## Solution

Solution

This solution demonstrates parallel data fetching with timing comparison and resilient error handling.

### Step 1: Create Data Fetching Functions with Simulated Delays

```tsx title="apps/web/src/app/data-demo/data.ts"
// Simulated API calls with realistic delays
// In production, these would be actual fetch calls to your API

export async function fetchUser(): Promise<{ name: string; email: string }> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { name: "John Doe", email: "john@example.com" };
}

export async function fetchPosts(): Promise<Array<{ id: number; title: string }>> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    { id: 1, title: "Getting Started with Next.js" },
    { id: 2, title: "Server Components Deep Dive" },
    { id: 3, title: "Caching Strategies" },
  ];
}

export async function fetchStats(): Promise<{ views: number; likes: number }> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return { views: 1234, likes: 567 };
}
```

### Step 2: Implement Parallel Fetching with Timing Comparison

```tsx title="apps/web/src/app/data-demo/page.tsx"
import { fetchPosts, fetchStats, fetchUser } from "./data";

// Parallel fetch with timing measurement
async function fetchParallel() {
  const startTime = performance.now();

  // Promise.all runs all fetches simultaneously
  // Total time = max(200, 300, 250) = ~300ms instead of 750ms sequential
  const [user, posts, stats] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchStats(),
  ]);

  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);

  return { user, posts, stats, duration };
}

export default async function DataDemoPage() {
  const { user, posts, stats, duration } = await fetchParallel();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 font-bold text-3xl">
        Data Fetching Without Waterfalls
      </h1>

      {/* Performance result banner */}
      <div className="mb-6 rounded-lg border-2 border-green-200 bg-green-50 p-4">
        <h2 className="font-semibold text-green-800">Performance Result</h2>
        <p className="text-green-700">
          Parallel fetch completed in{" "}
          <span className="font-bold font-mono">{duration}ms</span>
        </p>
        <p className="mt-2 text-green-600 text-sm">
          Sequential would take ~750ms (200 + 300 + 250ms). Parallel takes
          ~300ms (max of all three).
        </p>
      </div>

      <div className="space-y-6">
        {/* User data */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">User (200ms fetch)</h2>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>

        {/* Posts data */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Posts (300ms fetch)</h2>
          <ul className="list-inside list-disc">
            {posts.map((post) => (
              <li key={post.id}>{post.title}</li>
            ))}
          </ul>
        </div>

        {/* Stats data */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Stats (250ms fetch)</h2>
          <p>Views: {stats.views.toLocaleString()}</p>
          <p>Likes: {stats.likes.toLocaleString()}</p>
        </div>
      </div>

      {/* Code comparison */}
      <div className="mt-8 rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-semibold">Key Takeaway</h3>
        <pre className="overflow-x-auto font-mono text-sm">
          {`// ❌ Sequential (750ms total)
const user = await fetchUser();    // 200ms
const posts = await fetchPosts();  // 300ms
const stats = await fetchStats();  // 250ms

// ✅ Parallel (300ms total)
const [user, posts, stats] = await Promise.all([
  fetchUser(),    // All run
  fetchPosts(),   // simultaneously
  fetchStats(),   // max(200,300,250) = 300ms
]);`}
        </pre>
      </div>
    </main>
  );
}
```

### Step 3: Include Async Params in Promise.all (Next.js 16 Pattern)

When your page has dynamic route parameters, include `params` in your `Promise.all()`:

```tsx title="apps/web/src/app/users/[id]/page.tsx"
import { fetchPosts, fetchUser, fetchUserStats } from "@/lib/data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: PageProps) {
  // Include params in Promise.all for optimal performance
  const [{ id }, user, posts, stats] = await Promise.all([
    params, // Await params alongside data fetches
    fetchUser(), // These run in parallel with params resolution
    fetchPosts(),
    fetchUserStats(),
  ]);

  // Now use id for any dependent fetches
  // (Better: restructure so all independent fetches are in Promise.all)

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 font-bold text-2xl">User {id}</h1>
      <p>{user.name}</p>
      {/* ... */}
    </main>
  );
}
```

### Step 4: Error Handling with Promise.allSettled

For resilient error handling where partial data is acceptable:

```tsx title="apps/web/src/app/dashboard/page.tsx"
async function fetchDashboardData() {
  const results = await Promise.allSettled([
    fetchUser(),
    fetchPosts(),
    fetchStats(),
  ]);

  // Extract successful results, provide fallbacks for failures
  const user = results[0].status === "fulfilled"
    ? results[0].value
    : { name: "Guest", email: "" };

  const posts = results[1].status === "fulfilled"
    ? results[1].value
    : [];

  const stats = results[2].status === "fulfilled"
    ? results[2].value
    : { views: 0, likes: 0 };

  // Log failures for monitoring (add biome-ignore if using console.log)
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      // biome-ignore lint/suspicious/noConsole: monitoring
      console.error(`Fetch ${index} failed:`, result.reason);
    }
  });

  return { user, posts, stats };
}
```

### Key Decisions Explained

1. **Promise.all over sequential awaits**: Parallel execution reduces total time from sum of all requests to the max single request time.

2. **Include params in Promise.all**: In Next.js 16+, params are async. Including them in Promise.all prevents an extra sequential await.

3. **Promise.allSettled for resilience**: When partial data is acceptable, this prevents one failure from breaking the entire page.

4. **Foundation for caching**: This parallel pattern is the foundation for effective caching. In [Lesson 3.1](/03-advanced-patterns/cache-components), you'll learn to add `"use cache"` to expensive functions like `fetchUser()` and `fetchStats()`. Cached functions return instantly, while fresh functions (like reviews) run in parallel without blocking.

\*\*Side Quest: Implement Request Deduplication\*\*

## References

- <https://nextjs.org/docs/app/getting-started/fetching-data>
- <https://nextjs.org/docs/app/getting-started/caching-and-revalidating>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
