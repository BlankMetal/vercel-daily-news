# Phase 4: Subscription & Paywall

**Goal:** Cookie-based subscription flow with paywall enforcement on article pages.

**Lessons applied:** Server Actions for Forms, Client-Server Component Boundaries, Cookies/Session Persistence, Suspense Boundaries, Security Review

---

## Step 1: Server Actions (`lib/actions.ts`)

Create a `lib/actions.ts` file with two Server Actions:

### `subscribeAction()`

1. Call `POST /subscription/create` → get token from `x-subscription-token` response header
2. Call `POST /subscription` with that token → activate the subscription
3. Store the token in an HTTP-only cookie (`vnews-sub-token`, `SameSite=Lax`, `Path=/`, 30-day max-age)
4. Call `revalidatePath("/", "layout")` to refresh all pages (header indicator + any paywall)

Both API calls happen in a single action — one click for the user. The cookie makes it easy to undo: deleting it (via unsubscribe) immediately reverts to the paywall state.

### `unsubscribeAction()`

1. Read the token from the `vnews-sub-token` cookie
2. Call `DELETE /subscription` with the token
3. Delete the cookie
4. Call `revalidatePath("/", "layout")`

**Commit after this step.**

---

## Step 2: Subscription helper (`lib/subscription.ts`)

Create a server-only helper:

```ts
async function getSubscriptionStatus(): Promise<{ isSubscribed: boolean }>
```

- Reads the `vnews-sub-token` cookie via `cookies()` from `next/headers`
- If no cookie → `{ isSubscribed: false }`
- If cookie exists → call `GET /subscription` with the token
  - If status is `"active"` → `{ isSubscribed: true }`
  - If API errors or status is `"inactive"` → `{ isSubscribed: false }`

This helper is used by both the header and the article page. It runs on the server only — never shipped to the client.

**Commit after this step.**

---

## Step 3: Header subscription indicator

This step demonstrates nested Client/Server Component composition with Suspense boundaries.

### Architecture

```
<Header>                          ← Server Component (layout-level)
  <nav>
    ... logo, links ...
    <Suspense fallback={<SubscribeButtonSkeleton />}>
      <SubscriptionIndicator />   ← async Server Component (reads cookie, checks API)
        renders either:
          <SubscribeButton />     ← Client Component (form → subscribeAction)
          <SubscribedBadge />     ← Client Component (badge + form → unsubscribeAction)
    </Suspense>
  </nav>
</Header>
```

### Components

- **`Header`** — stays a Server Component. Wraps the subscription indicator in a `<Suspense>` boundary so the rest of the header (logo, nav links) renders instantly without waiting for the subscription API check.
- **`SubscriptionIndicator`** (`app/components/subscription-indicator.tsx`) — async Server Component. Calls `getSubscriptionStatus()`. Renders `<SubscribeButton />` or `<SubscribedBadge />` based on the result.
- **`SubscribeButton`** (`app/components/subscribe-button.tsx`) — Client Component (`"use client"`). A `<form action={subscribeAction}>` with a styled submit button. Needs to be a Client Component because Server Actions in forms require client-side form handling for the pending state.
- **`SubscribedBadge`** (`app/components/subscribed-badge.tsx`) — Client Component. Shows a "Subscribed ✓" badge and an "Unsubscribe" button (form with `unsubscribeAction`).
- **`SubscribeButtonSkeleton`** — small skeleton pill matching the button dimensions, shown while the subscription status loads.

### Why this composition matters (for the video)

This is a textbook example of the Client/Server Component boundary pattern:
- The **data fetching** (subscription check) stays in a Server Component — no token or API call leaks to the client
- The **interactivity** (form submission, pending states) lives in Client Components
- The **Suspense boundary** in the header means the subscription API call doesn't block the rest of the layout from rendering
- The server passes the *result* (which component to render) down, not the raw data

**Commit after this step.**

---

## Step 4: Paywall on article page

Modify `app/articles/[slug]/page.tsx`:

1. Call `getSubscriptionStatus()` at the top of the page component
2. If subscribed → render everything as-is (full `ContentRenderer`, subscribe CTA becomes a "thank you" or is hidden)
3. If not subscribed:
   - Render article header (category, title, author, date) — same as before
   - Render featured image — same as before
   - Extract the **first content block of type `"paragraph"`** from `article.content` and render it as a teaser
   - Below the teaser, render a prominent paywall CTA:
     - Visual separator (gradient fade over the truncated content)
     - "Subscribe to continue reading" heading
     - Brief value prop text
     - `<SubscribeButton />` (reuse the Client Component from Step 3)
   - Do NOT render trending articles when paywalled (they're below the fold and the user hasn't subscribed)

### Teaser logic

```ts
const firstParagraph = article.content.find((b) => b.type === "paragraph");
```

Render only that single block through `ContentRenderer` (pass `[firstParagraph]` as the blocks array). This keeps rendering consistent — same typography and markdown handling as the full article.

**Commit after this step.**

---

## Step 5: Reusable Subscribe CTA component

Refactor the existing placeholder CTA on the article page into a proper `<SubscribeCTA />` component (`app/components/subscribe-cta.tsx`):

- Server Component wrapper that checks `getSubscriptionStatus()`
- If not subscribed: renders the CTA box with heading, description, and `<SubscribeButton />`
- If subscribed: renders nothing (or a subtle "You have full access" note)
- Used in the article page (replaces the current placeholder) for the paywall block
- Could also be placed on the homepage or other pages later

**Commit after this step.**

---

## Step 6: Verify

### Test flow

1. **Start unsubscribed** — clear cookies, visit an article page → paywall shows (header, image, first paragraph, CTA)
2. **Subscribe via article page** — click "Subscribe to continue reading" → full content appears, header shows "Subscribed" badge
3. **Refresh** — still subscribed, full content shows
4. **Navigate** — go to homepage, click a different article → still subscribed, no paywall
5. **Unsubscribe via header** — click "Unsubscribe" → paywall returns, header shows "Subscribe" button
6. **Subscribe via header** — click "Subscribe" in header → paywall lifts on next article page visit

### Security checks

- Open browser DevTools → Application → Cookies: `vnews-sub-token` is HTTP-only (no JS access), `SameSite=Lax`
- `document.cookie` in console should NOT show the token
- View page source / network tab: no subscription token in client-side JS bundles

**Commit the final verification notes / any fixes, push, and verify on Vercel.**

---

## Files created/modified

| File | Type | Action |
|------|------|--------|
| `lib/actions.ts` | Server Actions | Create |
| `lib/subscription.ts` | Helper | Create |
| `app/components/subscription-indicator.tsx` | Server Component | Create |
| `app/components/subscribe-button.tsx` | Client Component | Create |
| `app/components/subscribed-badge.tsx` | Client Component | Create |
| `app/components/subscribe-cta.tsx` | Server Component | Create |
| `app/components/skeletons.tsx` | Skeletons | Modify (add button skeleton) |
| `app/components/header.tsx` | Server Component | Modify (add Suspense + indicator) |
| `app/articles/[slug]/page.tsx` | Page | Modify (add paywall logic) |

---

## Presentation notes to add

- **One-click subscribe/unsubscribe with easy undo** — Subscribe does create + activate in a single Server Action. Unsubscribe deletes the cookie and deactivates server-side. No confirmation dialogs — the action is trivially reversible by clicking the opposite button.
- **HTTP-only cookie** — Token only needed server-side, so no reason to expose to JS. Protects against XSS token theft.
- **SameSite=Lax** — Cookie sent on normal navigation but not on cross-site subrequests. CSRF protection without breaking inbound links.
- **Nested Client/Server Component composition** — Header demonstrates the boundary pattern: Server Component fetches data, Client Components handle interactivity, Suspense boundary prevents the API call from blocking layout rendering.
