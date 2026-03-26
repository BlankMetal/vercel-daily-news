---
title: "Project Setup"
description: "Deploy a working Next.js application to Vercel, clone it locally, and verify your development environment. Every lesson builds on this foundation."
canonical_url: "https://vercel.com/academy/nextjs-foundations/project-setup"
md_url: "https://vercel.com/academy/nextjs-foundations/project-setup.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-09T23:35:30.005Z"
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

# Project Setup

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Project Setup

You can't learn Next.js by reading about it. You need a working application you can break, fix, and extend. This lesson gets you from zero to deployed in under 10 minutes, with a real app running on Vercel and automatic preview deployments on every push.

Every lesson in this course builds on this foundation. Get this right, and the rest will flow naturally.

## Outcome

A working local development environment and a Vercel-connected repository that deploys previews on every push.

## What You're Getting with the Starter

This isn't a blank canvas. You're deploying a **working application** with:

- **Two Next.js apps**: `apps/web` (main app) and `apps/blog` (blog app)
- **Shared packages**: `packages/api` (data fetching) and `packages/ui` (components)
- **Working routes**: Home page, blog listing, dynamic post pages
- **API layer**: Blog posts, categories, and gallery data ready to use

Your job throughout this course is to **extend and modify** this foundation, not build from scratch. This mirrors real-world development where you'll rarely start with an empty folder.

## Understanding the Dual-App Architecture

This starter contains **two Next.js applications** running side-by-side. This isn't accidental - it teaches you real-world monorepo patterns where teams share code but deploy independently.

```
nextjs-foundations/
├── apps/
│   ├── web/              # Main marketing + dashboard app
│   │   └── src/app/      # Port 3000 (Vercel-deployed)
│   │
│   └── blog/             # Content-focused blog app
│       └── src/app/      # Port 3001
│
└── packages/
    ├── api/              # Shared data fetching
    └── ui/               # Shared components (shadcn)
```

**Which app should I work in?**

| App         | Purpose                          | Port | When You'll Use It                                                                             |
| ----------- | -------------------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| `apps/web`  | Main marketing and dashboard app | 3000 | **Most lessons** (95% of your work)                                                            |
| `apps/blog` | Content-focused blog app         | 3001 | [Dynamic Routing](/01-foundation-and-setup/dynamic-routing), Section 4 (Multi-app deployments) |

**Why two apps instead of one?**

Real companies organize apps this way:

- **Separation of concerns**: Marketing team owns `web`, content team owns `blog`
- **Independent deployment**: Deploy blog changes without touching web
- **Shared packages**: Both apps import from `@repo/ui` and `@repo/api`

When lessons switch to `apps/blog`, you'll see a callout like this:

\*\*Note: Switching Apps\*\*

This lesson works in `apps/blog` to explore dynamic routing in isolation. Most lessons use `apps/web`.

In **Section 4**, you'll connect both apps using Next.js rewrites, so users see a unified site (`vercel.com/blog` and `vercel.com`) while each app deploys independently behind the scenes.

## Fast Track

1. Click the Deploy Button below to copy and deploy
2. Install Vercel CLI: `pnpm i -g vercel && vercel login`
3. Clone your repo and link: `git clone ... && cd nextjs-foundations && vercel link`
4. Install and run: `pnpm i && pnpm dev`

## Step 1: Deploy to Vercel

Click this button to copy the repository to your GitHub account and deploy to Vercel in one step:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnextjs-foundations-starter\&project-name=nextjs-foundations\&repository-name=nextjs-foundations\&root-directory=apps/web\&env=NEXT_PUBLIC_APP_NAME,INTERNAL_CONFIG\&envDefaults=%7B%22NEXT_PUBLIC_APP_NAME%22%3A%22ACME%20Corporation%22%2C%22INTERNAL_CONFIG%22%3A%22server-only-value%22%7D\&envDescription=Demo%20environment%20variables%20for%20the%20course)

\*\*Warning: Deploy Now\*\*

**Stop and do this now.** Click the button, authorize GitHub if prompted, and wait for the deployment to complete. You'll see a success screen with your new repository URL.

Come back here once you see "Congratulations!" on Vercel.

**What just happened:**

- The starter repo was copied to your GitHub account
- Vercel deployed both apps automatically
- GitHub integration was configured for preview deployments

## Step 2: Install the Vercel CLI

The [Vercel CLI](https://vercel.com/docs/cli) connects your local environment to your Vercel project. You'll use it throughout this course to check deployments, pull environment variables, and manage your project.

```bash
# Install globally
pnpm add -g vercel

# Authenticate (opens browser)
vercel login
```

\*\*Note: Why the CLI?\*\*

The CLI gives you superpowers: check deployment status without leaving your terminal, pull production env vars locally, and deploy from anywhere. We'll use it often.

## Step 3: Clone and Install

Now get the code on your machine:

```bash
# Clone YOUR copy (replace with your GitHub username)
git clone https://github.com/YOUR_USERNAME/nextjs-foundations
cd nextjs-foundations

# Install dependencies
pnpm i
```

\*\*Note: Prerequisites\*\*

You need [Node.js 24+](https://nodejs.org/en/download) and **pnpm** installed. The repository uses [pnpm workspaces](https://pnpm.io/workspaces).

```bash
# Check your versions
node -v  # Should be v24.0.0 or higher
pnpm -v  # Any recent version works

# Install pnpm if needed
corepack enable && corepack prepare pnpm@latest --activate
```

## Step 4: Link Your Project

Navigate to the web app and connect it to the Vercel project you deployed:

```bash
cd apps/web
vercel link
```

Select your team and the `nextjs-foundations` project when prompted. When asked "Would you like to pull your environment variables?", answer **Yes**.

This creates:

- A `.vercel` directory linking your local app to the deployed project
- A `.env.local` file with **real working values**:

```bash title="apps/web/.env.local"
NEXT_PUBLIC_APP_NAME="ACME Corporation"
INTERNAL_CONFIG="server-only-value"
```

The deploy button baked these defaults into your Vercel project, so you get actual values immediately. No manual setup required.

\*\*Note: Verify Your Environment\*\*

Visit <http://localhost:3000/env-demo> after starting the dev server. You should see:

- **Public:** "ACME Corporation" (available in browser)
- **Server-only:** "server-only-value" (only visible on server)

If you see "undefined" for either value, run `vercel env pull` again from `apps/web`.

Return to the monorepo root for the remaining steps:

```bash
cd ../..
```

## Step 5: Run Locally

Start the development server:

```bash
pnpm dev
```

You'll see the Turborepo TUI (terminal UI) showing both apps:

```
┌ @repo/web#dev ─────────────────────────────────────────────────┐
│ ▲ Next.js 16.1.1 (Turbopack)                                   │
│ - Local:   http://localhost:3000                               │
│ ✓ Ready in 436ms                                               │
└────────────────────────────────────────────────────────────────┘
┌ @repo/blog#dev ────────────────────────────────────────────────┐
│ ▲ Next.js 16.1.1 (Turbopack)                                   │
│ - Local:   http://localhost:3001                               │
│ ✓ Ready in 436ms                                               │
└────────────────────────────────────────────────────────────────┘
```

Use arrow keys to switch between apps and see their logs.

\*\*Warning: Verify in Browser\*\*

Both apps run simultaneously on different ports:

- **<http://localhost:3000>**: `apps/web` (main app, deployed to Vercel)
- **<http://localhost:3001>**: `apps/blog` (blog app)

Open both URLs and confirm they load. The blog app fetches posts from the API layer (the shared data-fetching code in `packages/api` that both apps use).

## Step 6: Verify Preview Deployments

Make a small change and push to confirm the deployment pipeline works:

```bash
# Create a branch
git checkout -b test-preview

# Make any small change (add a comment, fix a typo)
echo "// test" >> apps/web/src/app/page.tsx

# Commit and push
git add -A
git commit -m "test: verify preview deployment"
git push -u origin test-preview
```

Check the deployment status from your terminal:

```bash
vercel list
```

You should see output like this:

```
> Deployments for yourteam/nextjs-foundations

  Age     Deployment                                          Status    Environment
  1m      https://nextjs-foundations-abc123.vercel.app        ● Ready   Preview
  5m      https://nextjs-foundations-xyz789.vercel.app        ● Ready   Production
```

The Preview deployment is your branch. Production is the main branch.

\*\*Note: CLI vs Dashboard\*\*

You can also check deployments in the [Vercel Dashboard](https://vercel.com/d?to=/\[team]/\[project]/deployments\&title=Check%20Deployments), but the CLI is faster for quick status checks.

After confirming the preview works, clean up:

```bash
git checkout main
git branch -D test-preview
git push origin --delete test-preview
```

## Done-When

- [ ] Vercel CLI installed and authenticated (`vercel whoami` shows your username)
- [ ] Project linked (`vercel link` completed, `.vercel` directory exists)
- [ ] `pnpm dev` runs both apps (web on :3000, blog on :3001)
- [ ] <http://localhost:3001> shows blog posts from the API layer
- [ ] Pushing a branch triggers a Vercel preview deployment (`vercel list` shows it)

## Explore What You Got

Before moving on, take 2 minutes to look around:

| Path                                    | What's There                         |
| --------------------------------------- | ------------------------------------ |
| `apps/web/src/app/page.tsx`             | Web app home page (Server Component) |
| `apps/web/src/app/env-demo/page.tsx`    | Environment variables demo           |
| `apps/blog/src/app/page.tsx`            | Blog listing page                    |
| `apps/blog/src/app/[slug]/page.tsx`     | Dynamic blog post route              |
| `packages/api/src/blog.ts`              | Blog data fetching functions         |
| `packages/ui/src/components/button.tsx` | Shared Button component (shadcn)     |

You don't need to understand all of this yet. Just know it exists. We'll explore each piece in upcoming lessons.

\*\*Note: Two Apps, One Deploy (For Now)\*\*

The deploy button set up `apps/web` on Vercel. Later in the course, you'll learn how to deploy multiple apps from a monorepo. For now, focus on `apps/web` for Vercel previews.

## Troubleshooting

Port already in use

```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Fix:** Kill the process or use a different port:

```bash
lsof -ti:3000 | xargs kill -9
# or
PORT=3001 pnpm dev
```

Module not found

```bash
Error: Cannot find module 'zod'
```

**Fix:** Clean install:

```bash
rm -rf node_modules .next apps/*/.next
pnpm install
```

pnpm not recognized

**Fix:** Install pnpm with corepack:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Wrong Node.js version

```bash
WARN  Unsupported engine: wanted: {"node":"24.x"}
```

**Fix:** Use [fnm](https://github.com/Schniz/fnm) to manage Node versions:

```bash
# Install fnm (macOS/Linux)
curl -fsSL https://fnm.vercel.app/install | bash

# Install and use Node 24
fnm install 24
fnm use 24
```

Vercel deployment fails

Check these in your [Vercel project settings](https://vercel.com/d?to=/\[team]/\[project]/settings\&title=Project%20Settings):

- **Build Command:** Should be auto-detected as `pnpm build` or `turbo build`
- **Root Directory:** Leave empty (monorepo root)
- **Node.js Version:** 24.x

If builds fail with type errors, run `pnpm build` locally first to see the actual error.

\*\*Note: Still Stuck?\*\*

Ask your coding agent for help. Paste the error message and it can diagnose the issue.

````markdown title="Prompt: Debug Next.js Setup Issues"
I'm setting up a Next.js 16 project and getting an error.

**Error message:**
```
___PASTE_ERROR_MESSAGE_HERE___
```

**My environment:**
- Node version: _____ (run `node -v` to check)
- Package manager: _____ (pnpm/npm/yarn)
- OS: _____ (macOS/Windows/Linux)

**What I was trying to do:**
___DESCRIBE_WHAT_YOU_WERE_DOING___

Example: "Running pnpm install" or "Starting dev server with pnpm dev"

Help me understand what's causing this error and how to fix it.
````

\*\*Side Quest: Configure Preview Deployment Notifications\*\*

## What's Next

You now have a working Next.js application deployed to production. In the next lesson, you'll learn how the **App Router** organizes your code: how `page.tsx`, `layout.tsx`, and folder structure map to URLs.


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
