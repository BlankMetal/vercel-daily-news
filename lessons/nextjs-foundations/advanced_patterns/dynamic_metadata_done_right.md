---
title: "Dynamic Metadata Done Right"
description: "Implement `generateMetadata` with direct data access or absolute URLs; avoid relative fetches on the server."
canonical_url: "https://vercel.com/academy/nextjs-foundations/dynamic-metadata-done-right"
md_url: "https://vercel.com/academy/nextjs-foundations/dynamic-metadata-done-right.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-15T14:21:57.723Z"
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

# Dynamic Metadata Done Right

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Dynamic Metadata Done Right

Broken metadata kills SEO (Search Engine Optimization) and social sharing previews. Relative URLs fail in `generateMetadata` because the server doesn't know the domain. Google uses OpenGraph (a metadata protocol used by social platforms for rich link previews) metadata for search ranking and social platforms need it for rich previews.

## Outcome

Working metadata with correct canonical URL (the preferred URL for a page, used by search engines to avoid duplicate content), OG tags, Twitter cards, and no server relative fetches. Direct function calls for data access or absolute URLs with environment variables.

## Fast Track

1. Use direct function calls like `getBlogPost(slug)` instead of API routes in `generateMetadata`.
2. If fetching is required, build absolute URLs from `process.env.API_URL`.
3. Add comprehensive OpenGraph and Twitter card metadata with images, timestamps, and authors.

## Hands-On Exercise 3.2

**Requirements:**

1. Implement `generateMetadata` for blog posts with title, description, keywords, authors.
2. Add OpenGraph metadata with featured image (1200x630), type, publishedTime.
3. Add Twitter card metadata with `summary_large_image`.
4. Include error handling with fallback metadata when post not found.
5. Avoid relative URL fetches on server - use direct data access or absolute URLs.

**Implementation hints:**

- **CRITICAL:** `fetch('/api/posts/${slug}')` fails in `generateMetadata` - server doesn't know domain.
- ✅ Preferred: Direct function calls like `getBlogPost(slug)`.
- ✅ Alternative: Absolute URLs `${process.env.API_URL}/api/posts/${slug}`.
- Set `metadataBase` in root layout for proper URL resolution.
- Keep metadata focused on SEO and social sharing essentials.

\*\*Note: Cross-App Metadata Patterns\*\*

This lesson demonstrates metadata in both apps for different use cases:

- **`apps/blog`** - Content-focused SEO with dynamic per-post metadata (`generateMetadata` for individual articles)
- **`apps/web`** - Marketing-focused metadata with static site-wide defaults (root layout configuration)

Both patterns use the same Next.js metadata API. The difference is *when* metadata is personalized (per-route vs site-wide).

\*\*Note: Need Help Generating Metadata?\*\*

Unsure what metadata fields to include or how to structure your `generateMetadata` implementation? Use this prompt:

```markdown title="Prompt: Generate generateMetadata Implementation"
<context>
I'm implementing dynamic metadata for a Next.js page using the generateMetadata function.
I need to generate SEO-optimized metadata with OpenGraph and Twitter card tags.
My page displays: [describe what your page shows - e.g., blog post, product page, user profile]
</context>

<current-implementation>
Show your current page component or data fetching function.

Example:
    // Your current code here
    export default async function MyPage({ params }: { params: Promise<{ slug: string }> }) {
      // ...
    }
</current-implementation>

<data-available>
What data do you have access to for this page?
- Title: [field name]
- Description: [field name]
- Image: [field name]
- Author: [field name]
- Published date: [field name]
- Tags/categories: [field name]
- [Other relevant fields]
</data-available>

<questions>
1. **Required fields:** What metadata is essential for my content type (blog, product, profile)?
2. **Image optimization:** What dimensions should OpenGraph images be? (Recommended: 1200x630)
3. **Fallbacks:** What should I show if data is missing or page not found?
4. **Twitter vs OG:** Do I need both Twitter card and OpenGraph tags, or just OpenGraph?
5. **Dynamic URLs:** Should I include canonical URLs? How do I handle absolute vs relative?
</questions>

<specific-scenario>
Example: Blog post with title, excerpt, featured image, author, and publish date
Expected metadata:
- Page title with site suffix
- Description from excerpt
- OpenGraph image 1200x630
- Article type with published time
- Author attribution
- Twitter large image card
</specific-scenario>

Generate a complete generateMetadata implementation with proper TypeScript types, error handling with fallbacks, OpenGraph tags, Twitter cards, and direct data access (no relative URLs). Include comments explaining each metadata field.
```

This will give you production-ready metadata that passes social sharing validators and maximizes SEO!

## Try It

1. **View page source:** Right-click page, "View Page Source", verify `<meta property="og:title">`, `<meta property="og:image">`, `<meta name="twitter:card">`.
2. **Test with sharing debuggers:**
   - Facebook: <https://developers.facebook.com/tools/debug/>
   - Twitter: <https://cards-dev.twitter.com/validator>
   - LinkedIn: <https://www.linkedin.com/post-inspector/>
3. **Verify absolute URLs:** All image URLs and canonical URLs should be absolute (start with https\://).

## Commit & Deploy

```bash
git add -A
git commit -m "feat(advanced): implement safe dynamic metadata with absolute URLs"
git push -u origin feat/advanced-dynamic-metadata
```

## Done-When

- [ ] Navigate to a blog post page, right-click and View Page Source: find `<meta property="og:title">` with post title
- [ ] In page source: find `<meta property="og:image">` with absolute URL starting with `https://`
- [ ] In page source: find `<meta name="twitter:card" content="summary_large_image">`
- [ ] In page source: find `<link rel="canonical">` with absolute URL to current page
- [ ] In page source: find `<meta property="og:type" content="article">`
- [ ] Open DevTools Console during server build: no "Failed to parse URL" or relative fetch errors
- [ ] Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator): preview shows correct title, description, and image

\*\*Side Quest: Social Sharing Preview Testing\*\*

\*\*Side Quest: Build an OG Image Generator API\*\*

## Solution

Click to reveal solution

### Dynamic Per-Post Metadata (apps/blog)

Add `generateMetadata` to the existing blog post page. The `@repo/api/blog` package provides `fetchPostBySlug`:

```typescript title="apps/blog/src/app/[slug]/page.tsx"
import { fetchPostBySlug } from '@repo/api/blog'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

// ✅ Direct data access - preferred approach
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  return {
    title: post.title, // Layout template adds " | VAF Blog" suffix
    description: post.excerpt,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author.name }],
    alternates: {
      canonical: `/${slug}`, // metadataBase resolves to absolute URL
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      authors: [post.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Back to posts
      </Link>

      <article className="flex flex-col gap-4">
        <header className="flex flex-col gap-2">
          <h1 className="font-bold text-4xl">{post.title}</h1>
          <p className="text-sm text-gray-500">
            {post.category} · {post.readingTime} min read ·{' '}
            {post.publishedAt.toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">By {post.author.name}</p>
        </header>

        <div className="prose max-w-none">
          {post.content.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <footer className="flex flex-wrap gap-2 border-t pt-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-600"
            >
              {tag}
            </span>
          ))}
        </footer>
      </article>
    </main>
  )
}
```

### Static Site-Wide Metadata with metadataBase (apps/blog)

Add `metadataBase` to the blog layout for proper URL resolution:

```typescript title="apps/blog/src/app/layout.tsx"
import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3001'
  ),
  title: {
    template: '%s | VAF Blog',
    default: 'Vercel Academy Foundation - Blog',
  },
  description: 'Articles and tutorials from the VAF team',
  openGraph: {
    siteName: 'VAF Blog',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="container mx-auto px-4 py-8">{children}</body>
    </html>
  )
}
```

\*\*Note: Critical Anti-Pattern: Relative URLs in generateMetadata\*\*

**❌ Never do this:**

```typescript
export async function generateMetadata({ params }) {
  // FAILS - server doesn't know domain
  const res = await fetch(`/api/posts/${params.slug}`)
}
```

**✅ Do this instead:**

```typescript
export async function generateMetadata({ params }) {
  // Option 1: Direct function call (preferred)
  const post = await getBlogPost(params.slug)

  // Option 2: Absolute URL with env var
  const res = await fetch(`${process.env.API_URL}/api/posts/${params.slug}`)
}
```

## References

- <https://nextjs.org/docs/app/getting-started/metadata-and-og-images>
- <https://nextjs.org/docs/app/api-reference/functions/generate-metadata>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
