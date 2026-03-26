---
title: "Third‑Party Scripts"
description: "Use `next/script` with `strategy=\"afterInteractive\"` (or appropriate) to defer non-critical scripts."
canonical_url: "https://vercel.com/academy/nextjs-foundations/third-party-scripts"
md_url: "https://vercel.com/academy/nextjs-foundations/third-party-scripts.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-18T19:14:43.219Z"
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

# Third‑Party Scripts

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Third‑Party Scripts

Third-party scripts like analytics, chat widgets, and ads can destroy your page performance if loaded incorrectly. Poor script loading blocks rendering, delays interactivity, and tanks Core Web Vitals scores (Google's key performance metrics: LCP, INP, CLS). The right loading strategy can prevent a 2-second delay in Time to Interactive.

\*\*Note: Working Directory\*\*

This lesson uses `apps/web`. All file paths are relative to that directory.

## Outcome

Third-party scripts loaded with optimal strategies: critical scripts before interaction, analytics after interaction, and non-essential widgets lazy-loaded.

## Fast Track

1. Replace raw `<script>` tags with Next.js `Script` component
2. Choose appropriate `strategy` prop for each script
3. Verify main thread is not blocked during page load

\*\*Note: Turbopack Build Performance\*\*

Turbopack significantly improves build performance for applications with many third-party scripts. Development server startup is faster, and production builds optimize script chunking more efficiently.

<https://nextjs.org/docs/app/api-reference/turbopack>

## Script Loading Strategies

Next.js provides four loading strategies for third-party scripts, each with different performance trade-offs.

### beforeInteractive (Use Sparingly)

\*\*Warning: Blocks Page Hydration\*\*

Only use `beforeInteractive` for critical polyfills that must load before React hydration. This strategy blocks the entire page from becoming interactive.

```tsx title="apps/web/src/app/layout.tsx"
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Script
          src="https://polyfill.io/v3/polyfill.min.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  )
}
```

**When to use:**

- Critical polyfills needed before React hydrates
- Browser feature detection that blocks rendering

**Performance impact:** Blocks page interactivity - use only when absolutely necessary.

### afterInteractive (Recommended Default)

\*\*Note: Best Balance of Functionality and Performance\*\*

Use `afterInteractive` for 90% of third-party scripts. Loads after the page becomes interactive, minimizing impact on user experience.

```tsx title="apps/web/src/app/layout.tsx"
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://analytics.example.com/script.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log('Analytics script loaded')
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
```

**When to use:**

- Analytics and tracking scripts (Google Analytics, Segment)
- Chat widgets (Intercom, Zendesk)
- Payment forms (Stripe, PayPal)
- Social media embeds
- A/B testing tools

**Performance impact:** Loads after page is interactive - minimal user-facing delay.

### lazyOnload (Lowest Priority)

```tsx title="apps/web/src/app/page.tsx"
import Script from 'next/script'

export default function HomePage() {
  return (
    <>
      <Script
        src="https://widget.example.com/chat.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
      />
      <main>
        <h1>Welcome</h1>
      </main>
    </>
  )
}
```

**When to use:**

- Non-essential chat widgets
- Social media share buttons
- Comment systems (Disqus)
- Background metrics collection
- Optional features users may not interact with

**Performance impact:** Lowest priority - loads after everything else, zero impact on core functionality.

### worker (Experimental)

\*\*Warning: Experimental Feature\*\*

The `worker` strategy is experimental and requires enabling `nextScriptWorkers` in next.config.js. Browser support is limited. Use with caution in production.

```tsx title="apps/web/src/app/page.tsx"
import Script from 'next/script'

export default function HomePage() {
  return (
    <Script
      src="https://analytics.example.com/heavy-script.js"
      strategy="worker"
    />
  )
}
```

**When to use:**

- Experimental feature
- Heavy computation scripts
- Scripts that don't need DOM access

**Performance impact:** Runs in Web Worker, off main thread - best performance but limited browser support.

## Performance Comparison

| Strategy            | Load Time         | Blocks Rendering | Use Cases                   |
| ------------------- | ----------------- | ---------------- | --------------------------- |
| `beforeInteractive` | Before hydration  | ✅ Yes            | Critical polyfills only     |
| `afterInteractive`  | After interactive | ❌ No             | Analytics, chat, payments   |
| `lazyOnload`        | After everything  | ❌ No             | Social widgets, comments    |
| `worker`            | Off main thread   | ❌ No             | Experimental, heavy scripts |

## Common Script Classifications

**Critical (beforeInteractive):**

- Browser polyfills for unsupported features
- Feature detection that affects rendering

**Important (afterInteractive):**

- Google Analytics, Segment, Mixpanel
- Stripe, PayPal payment forms
- Intercom, Zendesk chat widgets
- Google Maps, Mapbox
- Auth0, Clerk authentication

**Optional (lazyOnload):**

- Twitter/Facebook social embeds
- Disqus comments
- Share buttons
- Background metrics
- Non-essential widgets

\*\*Note: Need Help Measuring Third-Party Script Impact?\*\*

Unsure which scripts are actually hurting your performance and by how much? Use this structured prompt to audit and quantify third-party script impact:

```markdown title="Prompt: Audit Third-Party Script Impact"
<context>
I'm auditing third-party scripts in a Next.js application to measure their performance impact on Core Web Vitals and Time to Interactive (TTI).

My application setup:
- Next.js with App Router
- Multiple third-party scripts: analytics, chat widgets, social embeds, ads, etc.
- Some scripts loaded with next/script, others with raw script tags
- Need to measure actual impact on: TTI (Time to Interactive), FCP (First Contentful Paint), LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), TBT (Total Blocking Time)
</context>

<current-implementation>
I have multiple third-party scripts but don't know:
- Which scripts block rendering or delay interactivity
- How much each script contributes to page weight and load time
- Whether scripts are using optimal loading strategies
- If scripts cause layout shifts or main thread blocking
</current-implementation>

<problems>
1. **No visibility:** Can't tell which script is causing the 2-second TTI delay
2. **Mixed strategies:** Some scripts use beforeInteractive, others use default loading
3. **Unknown cost:** Don't know the size/execution time of each script
4. **Layout shifts:** Some scripts cause CLS issues but not sure which ones
5. **Third-party cascade:** One script loads others - hard to trace the full impact
</problems>

<questions>
1. **Measurement approach:** What's the best way to measure script impact?
   - Use Chrome DevTools Performance tab to track main thread blocking?
   - Use Lighthouse to compare scores with/without scripts?
   - Use WebPageTest to see waterfall of script loads?
   - Implement custom RUM (Real User Monitoring, collecting performance data from actual users) with Performance API?

2. **Metrics to track:** Which metrics best show script impact?
   - **TTI (Time to Interactive):** How long until page is fully interactive?
   - **TBT (Total Blocking Time):** How much do scripts block the main thread?
   - **JS Bundle Size:** How much does each script add to page weight?
   - **CLS (Cumulative Layout Shift):** Do scripts cause layout jumps?
   - **Network waterfall:** Do scripts delay critical resources?

3. **Isolation strategy:** How do I measure each script's individual impact?
   - Remove one script at a time and measure difference?
   - Use Chrome DevTools Coverage to see unused code?
   - Block scripts with DevTools and compare Lighthouse scores?
   - Use Request Blocking in Network tab?

4. **Strategy recommendations:** Based on measurements, how do I decide:
   - Which scripts to remove entirely (cost > benefit)?
   - Which scripts to move from beforeInteractive to afterInteractive?
   - Which scripts to move from afterInteractive to lazyOnload?
   - Which scripts to lazy-load only when user interacts?

5. **Reporting format:** Should the audit report include:
   - Per-script metrics (size, load time, blocking time)?
   - Before/after Core Web Vitals comparison?
   - Severity ratings (critical, high, medium impact)?
   - Specific optimization recommendations with code examples?
</questions>

<specific-scenario>
Example application with multiple scripts:

    <Script src="https://analytics.example.com/v1.js" strategy="beforeInteractive" />
    <Script src="https://chat.example.com/widget.js" strategy="afterInteractive" />
    <Script src="https://ads.example.com/script.js" />
    <script src="https://social.example.com/share.js"></script>

Current performance (from Lighthouse):
- TTI: 4.2s
- TBT: 890ms
- LCP: 2.8s
- CLS: 0.15
- JS Bundle: 1.2MB

Expected audit findings:

1. **Analytics script (critical impact):**
   - Size: 120KB
   - Blocking time: 450ms
   - Strategy: beforeInteractive (WRONG - blocks hydration)
   - CLS impact: None
   - **Recommendation:** Change to afterInteractive saves 450ms on TTI
   - **Code:**
       <Script src="https://analytics.example.com/v1.js" strategy="afterInteractive" />

2. **Chat widget (high impact):**
   - Size: 380KB
   - Blocking time: 290ms
   - Strategy: afterInteractive
   - CLS impact: 0.08 (widget causes layout shift)
   - **Recommendation:** Change to lazyOnload + add placeholder saves 290ms TBT, fixes CLS
   - **Code:**
       <Script src="https://chat.example.com/widget.js" strategy="lazyOnload" />

3. **Ads script (medium impact):**
   - Size: 250KB
   - Blocking time: 120ms
   - Strategy: default (no strategy = render-blocking)
   - **Recommendation:** Add strategy="lazyOnload" saves 120ms
   - **Code:**
       <Script src="https://ads.example.com/script.js" strategy="lazyOnload" />

4. **Social share (low impact but fixable):**
   - Size: 45KB
   - Uses raw script tag (should use Next.js Script)
   - **Recommendation:** Convert to Script component with lazyOnload
   - **Code:**
       <Script src="https://social.example.com/share.js" strategy="lazyOnload" />

Projected improvement after optimizations:
- TTI: 4.2s to 2.5s (1.7s faster - 40% improvement)
- TBT: 890ms to 140ms (750ms saved - 84% improvement)
- CLS: 0.15 to 0.07 (53% improvement)
- No change in functionality, all features still work

Measurement commands:

    # Baseline measurement
    npx lighthouse http://localhost:3000 --only-categories=performance

    # With scripts blocked (to measure total script cost)
    npx lighthouse http://localhost:3000 --only-categories=performance --blocked-url-patterns="analytics.example.com,chat.example.com"
</specific-scenario>

Generate a comprehensive script audit methodology with step-by-step measurement instructions, analysis techniques using Chrome DevTools and Lighthouse, and a detailed report format that quantifies the performance impact of each third-party script with specific optimization recommendations.
```

This prompt will help you build a data-driven approach to third-party script optimization, showing exactly which scripts hurt performance and by how much.

## Hands-On Exercise 4.3

The starter repo has raw `<script>` tags in the layout. Convert them to use `next/script` with proper loading strategies.

**Target file:** `apps/web/src/app/layout.tsx`

**Requirements:**

1. Find the raw `<script>` tags in the layout (Google Analytics)
2. Create a Client Component for the analytics scripts (required for `onLoad` callbacks)
3. Replace raw scripts with Next.js `Script` component
4. Apply `strategy="afterInteractive"` for analytics
5. Add `onLoad` callback to verify script loaded
6. Measure impact on Time to Interactive (TTI)

**Implementation hints:**

- `onLoad`, `onReady`, and `onError` callbacks only work in Client Components
- Create `apps/web/src/components/google-analytics.tsx` with `'use client'` directive
- Move analytics scripts to `afterInteractive` (not `beforeInteractive`)
- Use `lazyOnload` for anything below the fold
- Add `onLoad` callbacks to verify scripts loaded successfully:
  ```tsx
  'use client';
  import Script from 'next/script';

  export function GoogleAnalytics() {
    return (
      <Script
        src="/analytics.js"
        strategy="afterInteractive"
        onLoad={() => console.log('Analytics ready')}
      />
    );
  }
  ```
- Test on slow 3G network to see impact
- Check Chrome DevTools → Performance → Main thread activity

**Script audit checklist:**

```tsx
// Example classification
const scriptStrategy = {
  'analytics.js': 'afterInteractive',
  'chat-widget.js': 'lazyOnload',
  'social-share.js': 'lazyOnload',
  'payment-form.js': 'afterInteractive',
  'polyfill.js': 'beforeInteractive'
}
```

\*\*Note: Optional: Generate with v0\*\*

Use v0 for small UI shells that integrate with third-party widgets (e.g., consent banners, share buttons). Load the actual scripts with `next/script` and measure.

Prompt:

```text
Create a non-blocking third-party widget container with a placeholder skeleton and a consent toggle using Tailwind presentational only no inline scripts.
```

Open in v0: [Open in v0](https://v0.app?q=Create%20a%20non-blocking%20third-party%20widget%20container%20with%20a%20placeholder%20skeleton%20and%20a%20consent%20toggle%20using%20Tailwind%20presentational%20only%20no%20inline%20scripts.)

## Try It

1. **Test page load without scripts:**
   - Open Chrome DevTools → Performance
   - Record page load
   - Check main thread activity

2. **Add scripts with different strategies:**

   ```tsx
   <Script src="/slow-script.js" strategy="beforeInteractive" />
   ```

   Expected: Main thread blocked until script loads

   ```tsx
   <Script src="/slow-script.js" strategy="afterInteractive" />
   ```

   Expected: Page interactive before script loads

3. **Measure Time to Interactive (TTI):**
   - Use Lighthouse to measure TTI before and after optimization
   - Target: Reduce TTI by at least 500ms

## Commit & Deploy

```bash
git add -A
git commit -m "perf(scripts): optimize third-party script loading with next/script strategies"
git push -u origin feat/polish-third-party-scripts
```

## Done-When

- [ ] Layout uses `import Script from "next/script"`
- [ ] Raw `<script>` tags replaced with `<Script>` component
- [ ] Both scripts use `strategy="afterInteractive"`
- [ ] Inline script has `id` prop (required for inline scripts)
- [ ] Console shows "Google Analytics script loaded" on page load
- [ ] Chrome DevTools Performance tab shows no main thread blocking

## Solution

Complete optimized layout with next/script

The starter file at `apps/web/src/app/layout.tsx` has raw `<script>` tags. Since `onLoad` callbacks require Client Components, create a dedicated analytics component:

**Step 1: Create the GoogleAnalytics client component**

```tsx title="apps/web/src/components/google-analytics.tsx"
'use client';

import Script from 'next/script';

/**
 * Google Analytics component using next/script with proper loading strategy.
 * Must be a Client Component to use onLoad callback.
 */
export function GoogleAnalytics() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Google Analytics script loaded');
        }}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `,
        }}
      />
    </>
  );
}
```

**Step 2: Use in the layout**

```tsx title="apps/web/src/app/layout.tsx"
import type { Metadata } from "next";

import "./globals.css";
import { GoogleAnalytics } from "../components/google-analytics";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Vercel Academy Foundation - Web",
  description: "VAF Web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="container mx-auto px-4 py-8">
        {children}

        {/* Google Analytics - client component for onLoad support */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
```

**Key changes from starter:**

1. Created `GoogleAnalytics` Client Component with `'use client'` directive
2. Moved Script imports to the client component
3. Replaced raw `<script>` with `<Script>` component
4. Added `strategy="afterInteractive"` to defer loading
5. Added `id` prop to inline script (required for inline scripts)
6. Added `onLoad` callback to verify loading (requires Client Component)

**Why a Client Component for analytics?**

The `onLoad`, `onReady`, and `onError` callbacks only work in Client Components. This is because these callbacks need to run JavaScript in the browser after the script loads. Server Components can use `<Script>` without callbacks, but if you need load confirmation, extract to a Client Component.

**Why `afterInteractive` for analytics:**

- Page becomes interactive before analytics loads
- No blocking of hydration
- Users can interact immediately
- Analytics still tracks all events (just loads slightly later)

**Verify the improvement:**

1. Open Chrome DevTools → Performance tab
2. Record page load
3. Confirm main thread is not blocked by analytics script
4. Check Console for "Google Analytics script loaded" message

**Script Loading Strategy:**

1. **Audit**: Find all third-party scripts
2. **Classify**: Critical, important, or optional
3. **Apply strategy**:
   - Critical → `beforeInteractive` (rare)
   - Important → `afterInteractive` (default)
   - Optional → `lazyOnload` (aggressive)
4. **Measure**: Use Lighthouse to verify TTI improvement

**Best practice:** Default to `afterInteractive` for most scripts. Only use `beforeInteractive` for polyfills that must run before React hydration. Use `lazyOnload` aggressively for non-essential features.

**Performance wins:**

- Analytics deferred: +500ms TTI
- Chat widgets lazy-loaded: +800ms TTI
- Social embeds lazy-loaded: +300ms TTI

\*\*Side Quest: Script Performance Budget Monitor\*\*

## References

- <https://nextjs.org/docs/app/api-reference/components/script>
- <https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
