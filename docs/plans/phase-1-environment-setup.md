# Phase 1: Environment Setup — Detailed Plan

This is the detailed breakdown of Phase 1 from the [build plan](./build-plan.md). Each step is a separate commit.

---

## Step 1: Nix + direnv

**What:** Reproducible dev environment so anyone (or any machine) gets the exact same toolchain.

**Why:** Ensures Node 24, pnpm, and turbo are available without manual installs. When you `cd` into the project, direnv activates the Nix shell automatically. This is great to mention in your video — it shows you care about developer experience and reproducibility.

### Files to create

**`flake.nix`**

```nix
{
  description = "Vercel Daily News dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_24
            pnpm
          ];
        };
      });
}
```

**`.envrc`**

```
use flake
```

### After creating

```bash
direnv allow
node -v   # Should show v24.x
pnpm -v   # Should show a recent version
```

### Verify

- `cd` out and back in — direnv reloads automatically
- `node -v` and `pnpm -v` return expected versions

### Commit

```
Add Nix flake and direnv for reproducible dev environment
```

---

## Step 2: Deploy to Vercel

**What:** Link the project to Vercel and get a live production URL before writing any application code.

**Why:** Deploying first means every subsequent push creates a preview deployment. Reviewers see that you shipped early and often, not just at the end. It also catches build issues immediately.

### Steps

1. Run `vercel link` — select your team and create a new project called `vercel-daily-news`
2. Push to trigger the first deployment
3. Verify the default Next.js page is live at your `*.vercel.app` URL
4. Run `vercel list` to confirm the deployment shows as `Ready`

### Verify

- The Vercel dashboard shows the project
- The `*.vercel.app` URL loads the default Next.js starter page
- A `.vercel/` directory exists locally (already in `.gitignore`)

### Commit

No code changes in this step — just linking. If Vercel generates any config, commit it:

```
Link project to Vercel for continuous deployments
```

---

## Step 3: Environment variables

**What:** Configure the API base URL and bypass token as server-only env vars, both locally and on Vercel.

**Why:** The API requires an `x-vercel-protection-bypass` header on every request. These values must stay server-side (no `NEXT_PUBLIC_` prefix) so they never leak to the browser. This is a key security concept from the Environment and Security lesson.

### Files to create/update

**`.env.local`** (not committed — already in `.gitignore`)

```
API_BASE_URL=https://vercel-daily-news-api.vercel.app/api
API_BYPASS_TOKEN=OykROcuULI6YJwAwk3VnWv4gMMbpAq6q
```

**`.env.example`** (committed — shows other developers what's needed without exposing secrets)

```
API_BASE_URL=
API_BYPASS_TOKEN=
```

### Add env vars to Vercel

```bash
vercel env add API_BASE_URL production preview development
# Enter: https://vercel-daily-news-api.vercel.app/api

vercel env add API_BYPASS_TOKEN production preview development
# Enter: OykROcuULI6YJwAwk3VnWv4gMMbpAq6q
```

### Verify

- `cat .env.local` shows both vars
- `vercel env ls` shows both vars for all environments
- `.env.local` is not tracked by git (`git status` should not list it)

### Commit

```
Add .env.example for API configuration
```

---

## Step 4: Required meta tags

**What:** Add the `<meta name="generator">` and `theme-color` meta tags required by the OpenAPI spec's `x-generated` field.

**Why:** The API spec states: *"The consuming application must include a `<meta name="generator" content="vnews-cert-v3">` tag in the document head and set the theme-color to `#1a1a2e`."* This is a hidden requirement buried in the OpenAPI JSON — catching it shows attention to detail.

### Files to update

**`app/layout.tsx`** — Add to the metadata export:

```tsx
export const metadata: Metadata = {
  other: {
    generator: "vnews-cert-v3",
  },
  // This adds <meta name="theme-color" content="#1a1a2e">
  themeColor: "#1a1a2e",
};
```

Or if `themeColor` isn't available in the current Next.js version, use the `other` field or add it directly in the `<head>` via the layout's JSX.

### Verify

- Run `pnpm dev`, open the page, inspect the `<head>` in DevTools
- Confirm `<meta name="generator" content="vnews-cert-v3">` is present
- Confirm `<meta name="theme-color" content="#1a1a2e">` is present

### Commit

```
Add required generator and theme-color meta tags
```

---

## Step 5: API client and types

**What:** A typed `lib/api.ts` module with fetch helpers for every API endpoint, plus TypeScript types for all data models.

**Why:** Centralizing API calls in one module means every page imports the same typed functions. The types ensure you catch shape mismatches at build time, not in production. This is pure Server Component territory — these functions only run on the server.

### Files to create

**`lib/types.ts`** — All data model types:

```
Author, ContentBlock (discriminated union), Article, BreakingNews,
Category, Subscription, PaginationMeta,
ApiResponse<T>, PaginatedResponse<T>, ErrorResponse
```

**`lib/api.ts`** — Fetch helpers:

```
getArticles(params?)    → GET /articles
getArticle(id)          → GET /articles/{id}
getTrendingArticles(exclude?)  → GET /articles/trending
getBreakingNews()       → GET /breaking-news
getCategories()         → GET /categories
createSubscription()    → POST /subscription/create
getSubscription(token)  → GET /subscription
subscribe(token)        → POST /subscription
unsubscribe(token)      → DELETE /subscription
```

Each function:
- Reads `API_BASE_URL` and `API_BYPASS_TOKEN` from `process.env`
- Sets the `x-vercel-protection-bypass` header
- Returns typed data (unwraps the `{ success, data }` envelope)
- Throws on API errors

### Verify

- Temporarily add to `app/page.tsx`:
  ```tsx
  import { getArticles } from "@/lib/api";
  export default async function Home() {
    const articles = await getArticles();
    console.log(articles);
    return <div>Check terminal</div>;
  }
  ```
- Run `pnpm dev`, check the terminal — articles should log
- Run `pnpm build` — no type errors
- Remove the temporary code after verifying

### Commit

```
Add typed API client and data model types
```

---

## Step 6: Root layout, metadata, and font

**What:** Set up the root layout with a custom font, global styles, and default metadata with Open Graph.

**Why:** The root layout wraps every page — it's where you define the HTML structure, load fonts (via `next/font` to avoid layout shift), and set default metadata. The Open Graph defaults ensure every page has social sharing info even if it doesn't define its own.

### Files to update

**`app/layout.tsx`**:
- Import a font from `next/font/google` (e.g., Inter or Geist)
- Apply the font class to `<body>`
- Set metadata:
  - `title: { default: "Vercel Daily News", template: "%s | Vercel Daily News" }`
  - `description: "The latest news, tutorials, and insights for modern web developers."`
  - `openGraph: { title, description, siteName, type: "website" }`
  - Keep the generator and themeColor from Step 4

**`app/globals.css`**:
- Keep Tailwind imports (`@import "tailwindcss"`)
- Add any base styles (e.g., body background color matching the theme)

### Verify

- `pnpm dev` — page loads with the custom font (inspect `<body>` class)
- Check `<head>` in DevTools — title, description, OG tags all present
- No layout shift from font loading (font swap should be instant)

### Commit

```
Set up root layout with font, global styles, and metadata
```

---

## Step 7: Header component

**What:** A persistent header with logo and navigation.

**Why:** The header appears on every page via the root layout. It's a Server Component (no interactivity yet). The subscription indicator is just a placeholder — we'll wire it up in Phase 4.

### Files to create

**`app/components/header.tsx`**:
- Logo text "Vercel Daily" linking to `/`
- Nav links: "Home" (`/`), "Search" (`/search`)
- Placeholder "Subscribe" button (non-functional for now)
- Use `next/link` for client-side navigation
- Responsive: hamburger menu or collapsible nav on mobile

### Files to update

**`app/layout.tsx`**:
- Import and render `<Header />` above `{children}`

### Verify

- Header visible on `localhost:3000`
- Links navigate without full page reload (client-side navigation via `next/link`)
- Looks reasonable on mobile viewport

### Commit

```
Add header component with logo and navigation
```

---

## Step 8: Footer component

**What:** A simple footer with copyright.

**Why:** Required by the assignment spec. Keeps it simple — a Server Component with no interactivity.

### Files to create

**`app/components/footer.tsx`**:
- Copyright text: `© {new Date().getFullYear()} Vercel Daily News`
- Minimal styling

### Files to update

**`app/layout.tsx`**:
- Import and render `<Footer />` below `{children}`

### Verify

- Footer visible on `localhost:3000`
- Year displays correctly
- Page structure: Header → Content → Footer on every route

### Commit

```
Add footer component with copyright
```

---

## Step 9: Final verification and deploy

**What:** Full check of everything from Phase 1, then push for a Vercel deployment.

### Checklist

- [ ] `direnv` activates Nix shell on `cd` (correct Node/pnpm versions)
- [ ] `.env.local` has both API vars, `.env.example` is committed
- [ ] Meta tags (`generator`, `theme-color`) present in `<head>`
- [ ] API client fetches real data (test in a temp page or console log)
- [ ] `pnpm build` succeeds with no errors
- [ ] Root layout has font, metadata, OG tags
- [ ] Header shows on every page with working nav links
- [ ] Footer shows on every page with correct year
- [ ] Responsive on mobile
- [ ] Push to main — Vercel deployment succeeds
- [ ] Live URL shows the header/footer shell

### Commit

```
Complete Phase 1: project foundation and API layer
```

After this, you're ready for Phase 2 (Homepage).
