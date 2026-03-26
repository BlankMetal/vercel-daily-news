---
title: "Connecting Apps with Rewrites"
description: "Learn how to use Next.js rewrites to connect multiple applications into a seamless user experience. Configure multi-zone architecture for independent deployment with unified routing."
canonical_url: "https://vercel.com/academy/nextjs-foundations/multi-app-routing"
md_url: "https://vercel.com/academy/nextjs-foundations/multi-app-routing.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-15T12:36:48.402Z"
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

# Connecting Apps with Rewrites

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Connecting Apps with Rewrites

You have two apps—`apps/web` for marketing and `apps/blog` for content. They run on different ports. Users see two domains. This lesson fixes that.

## Outcome

Configure Next.js rewrites so navigating to `localhost:3000/blog` shows content from `apps/blog` while keeping the unified domain experience.

## Fast Track

**For experienced developers:**

1. Add `rewrites()` to `apps/web/next.config.ts` pointing `/blog/*` to `http://localhost:3001/*`
2. Start both apps: `pnpm dev` in workspace root
3. Visit `http://localhost:3000/blog` and verify blog content appears

## Why Multi-Zone?

**The Problem:** Different teams own different parts of your site. Marketing owns the homepage, content team owns the blog. They need independent deploy schedules but users expect one seamless site.

**Traditional Approach:** Monolith where all code lives in one app. Every deploy risks breaking everything. Teams block each other.

**Multi-Zone Pattern:** Each app deploys independently. Next.js rewrites route traffic between them. User sees one domain, your teams move independently.

```
User visits example.com/blog
  ↓
apps/web receives request
  ↓
Rewrite rule matches /blog/*
  ↓
Proxies to apps/blog
  ↓
User sees blog content at example.com/blog
```

## How Rewrites Work

Rewrites are **transparent proxies**. They:

- Match a URL pattern (source)
- Forward the request to a different URL (destination)
- Keep the original URL in the browser
- Work for both local development and production

**Key Difference from Redirects:**

- **Redirect**: Browser URL changes, new HTTP request
- **Rewrite**: Browser URL stays same, Next.js forwards internally

## Configure Rewrites

Add rewrites to the primary app (`apps/web`) that will route to the blog app.

```ts title="apps/web/next.config.ts" {4-12}
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/blog',
        destination: 'http://localhost:3001/blog',
      },
      {
        source: '/blog/:path*',
        destination: 'http://localhost:3001/blog/:path*',
      },
    ];
  },
};

export default nextConfig;
```

**What this does:**

- `source: '/blog'` matches the exact route `/blog`
- `source: '/blog/:path*'` matches `/blog/anything/nested`
- `:path*` is a **catch-all** parameter (captures everything after `/blog/`)
- `destination` points to the blog app running on port 3001

**Why Two Rules?**

The first rule handles the index route (`/blog`), the second handles all nested routes (`/blog/post-slug`). Without the first rule, visiting `/blog` wouldn't match.

## Try It

### 1. Start Both Apps

From your workspace root:

```bash
pnpm dev
```

This starts:

- `apps/web` on `http://localhost:3000`
- `apps/blog` on `http://localhost:3001`

### 2. Test Direct Access

Visit `http://localhost:3001/blog` directly. You should see the blog app's content. This confirms the blog app works independently.

**Expected Output:**

```
Blog posts list or blog homepage from apps/blog
```

### 3. Test Rewrite

Visit `http://localhost:3000/blog` (note the port 3000). You should see the **same blog content** but routed through the web app.

**Expected Output:**

```
Same blog content, but URL stays localhost:3000/blog
Network tab shows request to localhost:3000/blog
Blog app serves the content
```

**What's Happening:**

1. Browser requests `localhost:3000/blog`
2. `apps/web` receives request
3. Rewrite rule matches `/blog`
4. Next.js proxies request to `localhost:3001/blog`
5. `apps/blog` renders and returns content
6. User sees content at `localhost:3000/blog`

## Production Deployment

In local development, rewrites use `localhost:3001`. In production on Vercel, you configure the actual domains.

### Update Config for Production

```ts title="apps/web/next.config.ts" {1-5,9,13}
const blogUrl = process.env.BLOG_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/blog',
        destination: `${blogUrl}/blog`,
      },
      {
        source: '/blog/:path*',
        destination: `${blogUrl}/blog/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

### Vercel Deployment

Each app deploys separately:

```bash
# Deploy blog app
cd apps/blog
vercel --prod

# Note the deployment URL: https://blog-abc123.vercel.app

# Deploy web app with BLOG_URL
cd apps/web
vercel --prod --env BLOG_URL=https://blog-abc123.vercel.app
```

**Vercel Configuration (vercel.json):**

For more control, add `vercel.json` to workspace root:

```json title="vercel.json"
{
  "version": 2,
  "builds": [
    { "src": "apps/web/package.json", "use": "@vercel/next" },
    { "src": "apps/blog/package.json", "use": "@vercel/next" }
  ],
  "routes": [
    { "src": "/blog(.*)", "dest": "apps/blog" },
    { "src": "/(.*)", "dest": "apps/web" }
  ]
}
```

**Zero-Config Alternative:**

Vercel auto-detects monorepos. Deploy each app from its directory, then use environment variables to connect them. No `vercel.json` required for simple setups.

## Commit

```bash
git add apps/web/next.config.ts
git commit -m "feat(routing): add rewrites for multi-zone blog integration

Configure Next.js rewrites to proxy /blog/* requests from apps/web to
apps/blog, enabling independent deployment with unified user experience."
```

## Done-When

- [ ] Visiting `http://localhost:3000/blog` shows blog app content
- [ ] Browser URL stays `localhost:3000/blog` (doesn't redirect to 3001)
- [ ] Both apps can be developed and deployed independently
- [ ] Rewrite configuration uses environment variable for production URL

## Troubleshooting

404 on /blog route

**Problem:** Visiting `localhost:3000/blog` returns 404.

**Cause:** Rewrite rule not loaded or blog app not running.

**Fix:**

1. Restart `apps/web` dev server to reload config
2. Verify blog app is running on port 3001: `lsof -i :3001`
3. Check rewrite syntax matches exactly (common: missing `async`)

Blog app shows on wrong port

**Problem:** `localhost:3000/blog` shows content but from port 3000, not 3001.

**Cause:** Both apps have a `/blog` route. The web app's route shadows the rewrite.

**Fix:** Remove `/blog` routes from `apps/web/app` directory. Only `apps/blog` should have blog routes.

Styles broken on rewritten route

**Problem:** Content appears but CSS is missing.

**Cause:** Relative asset paths don't resolve correctly through the proxy.

**Fix:** Ensure both apps use absolute asset paths or configure `assetPrefix` in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  assetPrefix: process.env.ASSET_PREFIX || '',
  // ... rewrites
};
```

CORS errors in browser console

**Problem:** Console shows CORS errors when accessing /blog.

**Cause:** API requests from blog app trying to hit different origin.

**Fix:** Add CORS headers in `apps/blog/next.config.ts`:

```ts
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
      ],
    },
  ];
}
```

## Solution

Complete next.config.ts with production support

```ts title="apps/web/next.config.ts"
import type { NextConfig } from 'next';

// Use environment variable in production, localhost in development
const blogUrl = process.env.BLOG_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/blog',
        destination: `${blogUrl}/blog`,
      },
      {
        source: '/blog/:path*',
        destination: `${blogUrl}/blog/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

**Environment Variable Setup:**

```bash title=".env.local (for local override)"
# Optional: point to deployed blog in local dev
BLOG_URL=https://your-blog.vercel.app
```

**Vercel Dashboard Setup:**

1. Go to Project Settings → Environment Variables
2. Add `BLOG_URL` with value: `https://your-blog.vercel.app`
3. Redeploy `apps/web`

**Testing Checklist:**

- [ ] Local dev: both apps run, rewrites work
- [ ] Direct access: `localhost:3001/blog` works
- [ ] Proxied access: `localhost:3000/blog` works
- [ ] Production: deploy both apps, configure BLOG\_URL, verify

## Learn More

- [Next.js Rewrites Documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)
- [Multi-Zones Guide](https://nextjs.org/docs/app/guides/multi-zones)
- [Vercel Monorepo Deployment](https://vercel.com/docs/monorepos)

\*\*Side Quest: Build Cross-App Deep Links\*\*

## What's Next

You've connected two apps into one seamless experience. Next: final certification readiness review.


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
