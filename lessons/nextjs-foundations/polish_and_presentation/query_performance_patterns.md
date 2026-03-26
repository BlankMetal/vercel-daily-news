---
title: "Query Performance Patterns"
description: "Replace sequential queries with concurrency/batching strategies to cut latency and load."
canonical_url: "https://vercel.com/academy/nextjs-foundations/query-performance-patterns"
md_url: "https://vercel.com/academy/nextjs-foundations/query-performance-patterns.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-18T18:53:39.342Z"
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

# Query Performance Patterns

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Query Performance Patterns

\*\*Note: Working Directory\*\*

This lesson uses `apps/web`. All file paths are relative to that directory.

Sequential database queries are a silent performance killer. A page that loads three queries sequentially at 400ms each takes 1200ms total. Run them in parallel and it drops to 400ms. Optimize with database joins and it's 150ms. That's an 8x speedup with minimal code changes.

## Outcome

Database query patterns refactored from sequential to parallel or optimized joins, with measurable latency improvements.

## Fast Track

1. Identify sequential database queries causing waterfalls
2. Refactor independent queries to use `Promise.all()`
3. Optimize related data fetching with ORM includes/joins

## The N+1 Query Problem (Making N Extra Queries When 1 Would Suffice)

\*\*Note: Sequential Queries Kill Performance\*\*

The most common database performance mistake: loading data sequentially when you could load it in parallel or with a single optimized query. This is the **N+1 problem**.

- **Sequential**: 1200ms (400ms × 3 queries)
- **Parallel**: 400ms (3 queries at once)
- **Optimized**: 150ms (single query with joins)

**That's an 8x performance improvement.**

### Sequential Queries (Slow)

```tsx title="apps/web/src/app/posts/[slug]/page.tsx"
// ❌ SLOW: Sequential queries create a waterfall
async function getPostData(slug: string) {
  const post = await db.post.findUnique({ where: { slug } })
  const author = await db.user.findUnique({ where: { id: post.authorId } })
  const comments = await db.comments.findMany({
    where: { postId: post.id }
  })
  return { post, author, comments }
}
```

**Performance:** Each query waits for the previous one to complete.

- Query 1: 400ms (post)
- Query 2: 400ms (author) - starts after post finishes
- Query 3: 400ms (comments) - starts after post finishes
- **Total: 1200ms**

### Parallel Queries (Better)

```tsx title="apps/web/src/app/posts/[slug]/page.tsx" {2-8}
// ✅ BETTER: Parallel queries with Promise.all
async function getPostData(slug: string) {
  // First get the post to get IDs for related queries
  const post = await db.post.findUnique({ where: { slug } })
  
  // Then fetch related data in parallel
  const [author, comments] = await Promise.all([
    db.user.findUnique({ where: { id: post.authorId } }),
    db.comments.findMany({ where: { postId: post.id } })
  ])
  return { post, author, comments }
}
```

**Performance:** Related queries run simultaneously.

- Query 1: 400ms (post) - must run first
- Query 2: 400ms (author) - runs in parallel with comments
- Query 3: 400ms (comments) - runs in parallel with author
- **Total: 800ms** (1.5x faster)

### Optimized with Database Joins (Best)

```tsx title="apps/web/src/app/posts/[slug]/page.tsx" {2-18}
// ✅ BEST: Single optimized query with relationships
async function getPostData(slug: string) {
  const postData = await db.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { id: true, name: true, avatar: true }
      },
      comments: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          author: { select: { name: true, avatar: true } }
        }
      },
      _count: {
        select: { comments: true, likes: true }
      }
    }
  })

  return postData
}
```

**Performance:** Database handles joins efficiently with indexes (database structures that speed up lookups).

- Single query: 150ms
- **Total: 150ms** (8x faster than sequential)

## Performance Comparison

| Strategy                   | Time   | Speedup | When to Use           |
| -------------------------- | ------ | ------- | --------------------- |
| Sequential                 | 1200ms | 1x      | ❌ Never use           |
| Parallel (`Promise.all`)   | 400ms  | 3x      | ✅ Independent queries |
| Optimized (includes/joins) | 150ms  | 8x      | ✅ Related data        |

## When to Use Each Pattern

**Use `Promise.all()` for independent queries:**

```tsx
// These queries don't depend on each other
const [user, settings, notifications] = await Promise.all([
  db.user.findUnique({ where: { id } }),
  db.settings.findUnique({ where: { userId: id } }),
  db.notifications.findMany({ where: { userId: id, unread: true } })
])
```

**Use ORM includes for related data:**

```tsx
// Single query with relationships
const user = await db.user.findUnique({
  where: { id },
  include: {
    posts: true,
    comments: true,
    followers: true
  }
})
```

**Never use sequential for independent queries:**

```tsx
// ❌ BAD: No reason to wait between these
const user = await db.user.findUnique({ where: { id } })
const posts = await db.posts.findMany({ where: { authorId: id } })
```

\*\*Note: Need Help Identifying N+1 Query Problems?\*\*

Struggling to find sequential query waterfalls in your codebase? Use this structured prompt to systematically detect and fix N+1 problems:

```markdown title="Prompt: Identify N+1 Query Problems"
<context>
I'm auditing a Next.js application for N+1 query problems that cause performance bottlenecks.

My application setup:
- Next.js with App Router
- ORM: Prisma / Drizzle / TypeORM / raw SQL queries
- Database: PostgreSQL / MySQL / SQLite
- Server Components in /app/**/*.tsx
- Data fetching utilities in /lib/db/**/*.ts
</context>

<current-implementation>
I have multiple pages and API routes that fetch data from the database. Some may be running queries sequentially when they could be parallel or optimized with joins. I need to identify these bottlenecks systematically.
</current-implementation>

<problems>
1. **Hard to spot:** Sequential queries look normal in code but create massive performance waterfalls
2. **Hidden in loops:** Queries inside .map() or for loops are especially problematic
3. **Nested relationships:** Loading related data one record at a time instead of eager loading
4. **Mixed patterns:** Some files use parallel queries, others sequential - inconsistent
</problems>

<questions>
1. **Detection strategy:** What code patterns indicate N+1 problems?
   - Multiple await statements in sequence without dependencies?
   - await inside .map(), .forEach(), or for loops?
   - Missing ORM include/with for related data?
   - Queries that reference results from previous queries?

2. **Analysis approach:** Should I:
   - Parse AST to find sequential await patterns?
   - Use regex to detect suspicious code structures?
   - Instrument code with timing to measure actual impact?
   - Create a static analyzer that flags potential waterfalls?

3. **ORM-specific patterns:** How do I detect N+1 in:
   - **Prisma:** Missing include when accessing relations?
   - **Drizzle:** Not using with() for joins?
   - **TypeORM:** Missing relations in find() options?
   - **Raw SQL:** Multiple sequential queries that could be JOINed?

4. **False positives:** How do I avoid flagging:
   - Sequential queries that MUST run in order (dependent on previous results)?
   - Write operations that intentionally run sequentially for data consistency?
   - Cached queries that don't actually hit the database?

5. **Fix recommendations:** For each detected N+1, should I recommend:
   - Specific code changes (from sequential to Promise.all() to optimized join)?
   - Expected performance improvement (e.g., "1200ms to 150ms")?
   - ORM-specific syntax for eager loading?
</questions>

<specific-scenario>
Example N+1 problem in a post detail page:

    async function getPostData(slug: string) {
      // Query 1: Get post (400ms)
      const post = await db.post.findUnique({ where: { slug } })

      // Query 2: Get author (400ms) - WAITS for Query 1
      const author = await db.user.findUnique({ where: { id: post.authorId } })

      // Query 3: Get comments (400ms) - WAITS for Query 2
      const comments = await db.comments.findMany({
        where: { postId: post.id }
      })

      return { post, author, comments }
    }

Expected analysis:
- N+1 detected: 3 sequential queries (2 could be parallel)
- Current performance: 1200ms (400ms × 3)
- Fix #1: Use Promise.all() for author+comments: 800ms (1.5x faster)
- Fix #2: Use Prisma include results in 150ms (8x faster)

Suggested code:

    // Option 1: Parallel queries for related data
    const post = await db.post.findUnique({ where: { slug } })
    const [author, comments] = await Promise.all([
      db.user.findUnique({ where: { id: post.authorId } }),
      db.comments.findMany({ where: { postId: post.id } })
    ])

    // Option 2: Optimized with includes (best)
    const postData = await db.post.findUnique({
      where: { slug },
      include: { author: true, comments: true }
    })

Another example - N+1 in a loop:

    // CRITICAL N+1: Query inside loop
    const users = await db.users.findMany()
    for (const user of users) {
      // This runs a query for EACH user - 100 users = 100 queries!
      user.posts = await db.posts.findMany({ where: { authorId: user.id } })
    }

Expected analysis:
- CRITICAL: Query inside loop (N+1 problem)
- Current: 100 users × 200ms = 20 seconds!
- Fix: Use eager loading with include

Suggested code:

    const users = await db.users.findMany({
      include: { posts: true }
    })
    // Single query with JOIN - 300ms total
</specific-scenario>

Generate a Node.js analysis script that scans my codebase for N+1 query patterns, produces a detailed report with performance impact estimates, and provides specific fix recommendations with code examples. Prioritize findings by severity (critical for loops, high for sequential, medium for potential optimizations).
```

This prompt will help you build an automated N+1 detector that identifies performance bottlenecks before they impact production.

## Hands-On Exercise 4.2

Create a posts page that demonstrates parallel data fetching with `Promise.all()`.

**Target file:** `apps/web/src/app/posts/[slug]/page.tsx`

**Requirements:**

1. Create a post detail page that fetches post, author, and comments
2. Use `Promise.all()` for independent queries
3. Add timing logs to measure before/after performance
4. Verify the speedup in server logs
5. Document the performance improvement

**Implementation hints:**

- Look for multiple `await` statements in sequence
- Check if queries depend on previous results (if not, parallelize)
- Use ORM's `include` or `select` to reduce query count
- Add `console.time()` and `console.timeEnd()` to measure:
  ```tsx
  console.time('getPostData')
  const data = await getPostData(slug)
  console.timeEnd('getPostData')
  ```
- Test with realistic data volumes (100+ records)

**Example timing measurement:**

```tsx
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const start = Date.now()
  const postData = await getPostData(slug)
  const duration = Date.now() - start

  console.log(`[post] Loaded post data in ${duration}ms`)

  return <Post data={postData} />
}
```

## Try It

1. **Before optimization:**
   ```bash
   # Load the post page and check logs
   curl http://localhost:3000/posts/my-first-post
   ```
   Expected log: `[post] Loaded post data in 1200ms`

2. **After parallel optimization:**
   ```bash
   # Same request, parallel queries
   curl http://localhost:3000/posts/my-first-post
   ```
   Expected log: `[post] Loaded post data in 800ms` (1.5x faster)

3. **After join optimization:**
   ```bash
   # Same request, single query with includes
   curl http://localhost:3000/posts/my-first-post
   ```
   Expected log: `[post] Loaded post data in 150ms` (8x faster)

## Commit & Deploy

```bash
git add -A
git commit -m "perf(queries): eliminate N+1 problem with parallel and optimized queries"
git push -u origin feat/polish-query-concurrency
```

## Done-When

- [ ] Post page uses `Promise.all()` for independent queries
- [ ] Related data fetches (author, comments) run in parallel
- [ ] Server logs show timing (e.g., `[post] Loaded in 200ms`)
- [ ] Load time is reduced from sequential baseline
- [ ] At least 1.5x speedup verified in logs

## Solution

Complete optimized post page

Here's a post detail page demonstrating `Promise.all()` for parallel data fetching:

```tsx title="apps/web/src/app/posts/[slug]/page.tsx"
import { Suspense } from "react";

// Mock data fetching functions (simulate API calls)
async function fetchPost(slug: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    id: "post-1",
    slug,
    title: "Understanding Parallel Data Fetching",
    content: "This post demonstrates how to optimize data loading...",
    authorId: "user-1",
    createdAt: new Date("2024-01-15"),
  };
}

async function fetchAuthor(authorId: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    id: authorId,
    name: "Demo Author",
    avatar: "/avatars/demo.jpg",
  };
}

async function fetchComments(postId: string) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return [
    { id: "c1", author: "Reader 1", text: "Great article!" },
    { id: "c2", author: "Reader 2", text: "Very helpful, thanks!" },
  ];
}

// ✅ OPTIMIZED: Parallel fetching with Promise.all
async function PostContent({ slug }: { slug: string }) {
  const start = Date.now();

  // First fetch the post (needed for authorId and postId)
  const post = await fetchPost(slug);

  // Then fetch related data in parallel
  const [author, comments] = await Promise.all([
    fetchAuthor(post.authorId),
    fetchComments(post.id),
  ]);

  const duration = Date.now() - start;
  console.log(`[post] Loaded in ${duration}ms (parallel)`);
  // Expected: ~400ms instead of ~600ms sequential

  return (
    <article className="space-y-6">
      <header>
        <h1 className="font-bold text-3xl">{post.title}</h1>
        <div className="flex items-center gap-2 mt-2 text-gray-600">
          <span>By {author.name}</span>
          <span>•</span>
          <time>{post.createdAt.toLocaleDateString()}</time>
        </div>
      </header>

      <div className="prose">
        <p>{post.content}</p>
      </div>

      <section>
        <h2 className="mb-4 font-semibold text-xl">
          Comments ({comments.length})
        </h2>
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="p-3 bg-gray-50 rounded">
              <strong>{comment.author}</strong>
              <p>{comment.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Suspense
        fallback={<div className="animate-pulse">Loading post...</div>}
      >
        <PostContent slug={slug} />
      </Suspense>
    </main>
  );
}
```

**Key optimization:**

1. Post must be fetched first (we need `authorId` and `postId`)
2. Author and comments are fetched in parallel with `Promise.all()`
3. Total time: \~400ms instead of \~600ms sequential (1.5x faster)

**For maximum optimization, use database includes:**

```tsx
// Single query with all related data
const postData = await db.post.findUnique({
  where: { slug },
  include: {
    author: { select: { name: true, avatar: true } },
    comments: { include: { author: true } }
  }
})
// Total: ~150ms (4x faster than sequential)
```

**Verify the improvement:**

```bash
# Check server logs after loading /posts/my-first-post
# Before: [post] Loaded in 600ms (sequential)
# After:  [post] Loaded in 400ms (parallel)
# Best:   [post] Loaded in 150ms (with includes)
```

**Query Optimization Checklist:**

1. **Identify waterfalls**: Look for multiple sequential `await` statements
2. **Parallelize independent queries**: Use `Promise.all()` when queries don't depend on each other
3. **Use database relationships**: Leverage ORM includes/joins to fetch related data in one query
4. **Measure impact**: Add timing logs to prove the improvement
5. **Document**: Note before/after times in comments or commit message

**Key principle:** Database round-trips are expensive. Minimize them by running queries in parallel or combining them with joins.

**Performance gains:**

- Sequential → Parallel: 3x faster
- Sequential → Optimized joins: 8x faster
- Zero code complexity increase

\*\*Note: Advanced Pattern\*\*

This section covers advanced cache invalidation patterns. It's bonus content that goes beyond the core workshop. Feel free to skip if you're short on time.

## Cache Invalidation APIs

Next.js provides refined cache invalidation APIs for granular control over cache behavior: `updateTag()` for immediate cache updates in Server Actions and `revalidateTag()` for stale-while-revalidate semantics (serve cached data immediately while fetching fresh data in the background) in both Server Actions and Route Handlers.

\*\*Note: updateTag vs revalidateTag\*\*

**Key differences:**

| Feature            | `updateTag()`                                                  | `revalidateTag()`                                |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------------ |
| **Where to use**   | Server Actions only                                            | Server Actions + Route Handlers                  |
| **Cache behavior** | Next request waits for fresh data                              | Serves stale while fetching fresh (with `'max'`) |
| **Use case**       | Read-your-own-writes (user immediately sees their own changes) | Background updates (eventual consistency)        |
| **Example**        | User creates post, sees it immediately                         | Blog list updates in background                  |

### updateTag() - Immediate Cache Updates (Server Actions Only)

Use `updateTag()` in Server Actions when you need immediate cache invalidation for read-your-own-writes scenarios:

```tsx title="apps/web/src/app/actions/update-user.ts" {1,8}
'use server'

import { updateTag } from 'next/cache'

export async function updateUserAction(userId: string, data: any) {
  await db.user.update({ where: { id: userId }, data })

  // Immediate cache invalidation - next request waits for fresh data
  updateTag(`user-${userId}`)

  return { success: true }
}
```

**Benefits:**

- User sees their changes immediately (no stale data)
- Surgical cache updates without invalidating unrelated data
- Better cache hit rates compared to broad invalidation

\*\*Warning: Route Handler Restriction\*\*

`updateTag()` **cannot** be used in Route Handlers. If you need cache invalidation in a Route Handler (e.g., webhooks, which are HTTP callbacks triggered by external events), use `revalidateTag(tag, 'max')` instead.

### revalidateTag() - Stale-While-Revalidate

Use `revalidateTag()` with `'max'` profile for stale-while-revalidate semantics. Works in both Server Actions and Route Handlers:

```tsx title="apps/web/src/app/api/webhooks/content-update/route.ts" {1,8}
import { revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  const { tag } = await request.json()

  // Webhook updates CMS content
  await processCMSUpdate()

  // Mark cached data as stale - serves stale while fetching fresh in background
  revalidateTag(tag, 'max')

  return Response.json({ revalidated: true })
}
```

**In Server Actions:**

```tsx title="apps/web/src/app/actions/update-user.ts" {1,8-11}
'use server'

import { revalidateTag } from 'next/cache'

export async function updateUserAction(userId: string, data: any) {
  await db.user.update({ where: { id: userId }, data })

  // General user list cache - stale-while-revalidate
  revalidateTag('users', 'max')

  // This specific user's data - stale-while-revalidate
  revalidateTag(`user-${userId}`, 'max')

  return { success: true }
}
```

**When to use which:**

- **updateTag()**: User creates/updates content and needs to see it immediately (Server Actions only)
- **revalidateTag()**: Background cache updates where slight delay is acceptable (Server Actions + Route Handlers)

**Example: User profile update with correct API choice:**

```tsx title="apps/web/src/app/actions/update-profile.ts" {1,10-14}
'use server'

import { updateTag, revalidateTag } from 'next/cache'

export async function updateProfileAction(userId: string, updates: any) {
  await db.user.update({ where: { id: userId }, data: updates })

  // User's own data - immediate consistency (read-your-own-writes)
  updateTag(`user-${userId}`)

  // Related data - eventual consistency is fine
  revalidateTag('user-list', 'max')
  revalidateTag(`user-${userId}-posts`, 'max')

  return { success: true }
}
```

\*\*Side Quest: Database Query Profiler Dashboard\*\*

## References

- <https://nextjs.org/docs/app/getting-started/fetching-data>
- <https://nextjs.org/docs/app/getting-started/caching-and-revalidating>
- <https://nextjs.org/docs/app/api-reference/functions/revalidateTag>
- <https://nextjs.org/docs/app/api-reference/functions/updateTag>
- <https://nextjs.org/docs/app/api-reference/functions/cacheLife>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
