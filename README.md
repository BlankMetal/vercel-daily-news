# Vercel Daily News

A news publication built with Next.js 16, demonstrating Partial Prerendering, Cache Components, Server Actions, and Suspense streaming.

Live: [vercel-daily-news-ten.vercel.app](https://vercel-daily-news-ten.vercel.app)

## Pages

- **`/`** — Homepage with hero, breaking news banner, and featured articles grid
- **`/articles/[slug]`** — Article detail with paywall, content rendering, and trending sidebar
- **`/search`** — Search with debounced auto-search, category filtering, and URL-persisted state

## Getting Started

This project uses [Nix](https://nixos.org/) and [direnv](https://direnv.net/) for a reproducible dev environment. If you have both installed:

```bash
direnv allow
```

Otherwise, ensure you have Node.js 24+ and pnpm installed.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `API_BASE_URL` | Base URL for the news API |
| `API_BYPASS_TOKEN` | Vercel protection bypass token |

Both are server-only (no `NEXT_PUBLIC_` prefix).

## Architecture

- **Server Components** for all read-only content (zero client JS)
- **Client Components** limited to search form, subscribe button, and subscribed badge
- **`"use cache"`** with `cacheLife` and `cacheTag` for tiered caching (minutes, hours, default)
- **`<Suspense>`** boundaries with skeleton fallbacks for progressive streaming
- **Server Actions** for subscribe/unsubscribe mutations
- **`generateStaticParams`** to prerender article pages at build time
- **Partial Prerendering** (`cacheComponents: true`) on all routes

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
