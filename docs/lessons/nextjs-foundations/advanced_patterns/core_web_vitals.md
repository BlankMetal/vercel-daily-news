---
title: "Core Web Vitals + Measurement"
description: "Instrument measurement for key vitals and use results to drive performance decisions."
canonical_url: "https://vercel.com/academy/nextjs-foundations/core-web-vitals-and-measurement"
md_url: "https://vercel.com/academy/nextjs-foundations/core-web-vitals-and-measurement.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-16T21:41:15.304Z"
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

# Core Web Vitals + Measurement

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Core Web Vitals + Measurement

Your Lighthouse score is 98 but Google Search Console shows "Poor" Core Web Vitals. Your site dropped in rankings and you don't know why.

Here's the disconnect: Lighthouse measures lab data (synthetic tests), but Google ranks based on field data (real users over 28 days). That 98 score means nothing if your actual users on 3G mobile are experiencing 4-second LCP. Time to measure what actually matters.

## Outcome

Vitals instrumentation with Vercel Speed Insights or custom reporting. Track LCP < 2.5s, INP < 200ms, CLS < 0.1 targets. Real user data (not synthetic Lighthouse scores) informs performance improvements.

## Fast Track

1. Add `@vercel/speed-insights` for real-time Core Web Vitals tracking.
2. Monitor LCP (loading), INP (interactivity), CLS (visual stability) in production.
3. Use field data (real user measurements) to identify bottlenecks - Google only ranks based on real user data, not lab data (synthetic measurements from testing tools like Lighthouse).

## Hands-On Exercise 3.6

**Requirements:**

1. Install `@vercel/speed-insights` and `@vercel/analytics` for real-time vitals tracking.
2. Capture LCP (Largest Contentful Paint), INP (Interaction to Next Paint), CLS (Cumulative Layout Shift).
3. Set up custom reporting endpoint to log vitals to your analytics system.
4. Document thresholds: LCP < 2.5s, INP < 200ms, CLS < 0.1.
5. Track improvements after image/font/rendering optimizations.

**Implementation hints:**

- **Google uses field data only for ranking** - real user data from Chrome over 28-day window.
- Field data = 75th percentile of users over last 28 days.
- Lighthouse scores don't affect SEO - only real user Core Web Vitals do.
- Vercel Speed Insights shows real-time data - Google takes 28 days to reflect changes.
- Core Web Vitals are UX metrics - use them to debug performance issues, not just chase rankings.
- Mobile and desktop tracked separately.
- Only "sufficiently popular" and "publicly discoverable" pages tracked by Google.

## Try It

1. **Monitor real-time vitals:**
   - Deploy to Vercel with Speed Insights enabled.
   - Visit production site, interact with page.
   - Check Vercel dashboard for LCP, INP, CLS metrics.

2. **Test vitals locally:**
   - Open DevTools Console, look for web-vitals logs.
   - Use Lighthouse Performance tab for lab data (not used for ranking).
   - Compare field data (real users) vs lab data (synthetic).

3. **Verify tracking:**
   - Trigger interaction (click, type) and verify INP captured.
   - Scroll page and verify CLS remains < 0.1.
   - Check LCP element in Performance tab - should be hero image or main content.

\*\*Note: Need Help Diagnosing Web Vitals Issues?\*\*

Seeing poor Core Web Vitals scores but unsure what's causing them? Use this prompt to debug:

```markdown title="Prompt: Diagnose Core Web Vitals Issues"
<context>
I'm measuring Core Web Vitals for my Next.js app and need to identify and fix performance issues.
I have access to: [Lighthouse reports, Vercel Speed Insights, Chrome DevTools, PageSpeed Insights]
My current scores: [paste your LCP, INP, CLS values]
</context>

<current-metrics>
Report your Core Web Vitals measurements:
- **LCP (Largest Contentful Paint):** [value] ms - Target: < 2500ms
- **INP (Interaction to Next Paint):** [value] ms - Target: < 200ms
- **CLS (Cumulative Layout Shift):** [value] - Target: < 0.1
- **Device tested:** [Desktop, Mobile, or both]
- **Measurement source:** [Lighthouse, PageSpeed Insights, Speed Insights, Chrome DevTools]
</current-metrics>

<lcp-analysis>
If LCP is poor (> 2500ms):
- What is the LCP element? [Hero image, text block, video, etc.]
- Image size and format: [e.g., 2MB JPEG, 500KB PNG]
- Image loading: [Does it use next/image with priority prop?]
- Server response time (TTFB): [Check Network tab]
- Blocking resources: [Large JavaScript bundles, render-blocking CSS]
</lcp-analysis>

<inp-analysis>
If INP is poor (> 200ms):
- What interaction is slow? [Button click, form input, navigation]
- JavaScript bundle size: [Check bundle analyzer or Network tab]
- Third-party scripts: [Analytics, chat widgets, ad scripts]
- Long tasks: [Check Performance tab for tasks > 50ms]
- Client-side rendering: [Heavy React re-renders, large state updates]
</inp-analysis>

<cls-analysis>
If CLS is poor (> 0.1):
- What elements shift? [Images, ads, fonts, injected content]
- Images without dimensions: [Missing width/height on Image component]
- Font loading: [FOIT/FOUT causing text reflow]
- Dynamic content: [Banners, popups injected after page load]
- Layout reserved space: [Skeleton screens, placeholders]
</cls-analysis>

<questions>
1. **Root cause:** Which specific element or resource is causing the poor metric?
2. **Quick wins:** What's the highest-impact fix I can implement first?
3. **Next.js optimizations:** Am I using the right rendering strategy, next/image, next/font?
4. **Trade-offs:** Will fixing this metric negatively impact another metric?
5. **Measurement gap:** Why do lab scores (Lighthouse) differ from field data (real users)?
</questions>

<specific-scenario>
Example issue:
- LCP: 4200ms (red - very poor)
- LCP element: Hero image (1.8MB JPEG, 2400x1600)
- Current implementation: <img src="/hero.jpg" />
- No priority loading, no format optimization

Diagnosis:
1. **Problem:** Large unoptimized image blocking LCP
2. **Solution:** Replace with <Image priority> for preload, automatic WebP/AVIF format
3. **Expected improvement:** LCP reduces to < 2000ms with optimized formats and preloading
</specific-scenario>

Diagnose my Core Web Vitals issues and provide specific Next.js optimizations with implementation code (next/image priority, Suspense boundaries, font display strategies, width/height attributes) and expected metric improvements for each fix.
```

This helps you systematically identify bottlenecks and apply the right Next.js optimizations to move metrics from red to green!

## Commit & Deploy

```bash
git add -A
git commit -m "feat(advanced): add core web vitals measurement"
git push -u origin feat/advanced-vitals
```

## Done-When

- [ ] `instrumentation-client.ts` exists in `apps/web/src/` and imports `registerWebVitals`
- [ ] Open DevTools Console on any page: see "LCP:", "INP:", and "CLS:" log entries with numeric values
- [ ] LCP value logged is < 2500ms (green zone) or identifies specific improvement needed
- [ ] INP value logged is < 200ms after clicking a button or typing in an input
- [ ] CLS value logged is < 0.1 after page fully loads and stabilizes
- [ ] Open Vercel dashboard → Speed Insights: see real user Core Web Vitals data appearing
- [ ] Run Lighthouse in DevTools → Performance tab: LCP element identified in "Largest Contentful Paint element" section

\*\*Side Quest: Web Vitals Impact Analysis\*\*

## Solution

Click to reveal solution

```typescript title="apps/web/src/app/layout.tsx"
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

```typescript title="apps/web/src/lib/web-vitals.ts"
import { onCLS, onINP, onLCP } from 'web-vitals'

export function registerWebVitals() {
  onLCP((metric) => {
    console.log('LCP:', metric.value, 'ms', 'Target: <2500ms')
    sendToAnalytics(metric)
  })

  onINP((metric) => {
    console.log('INP:', metric.value, 'ms', 'Target: <200ms')
    sendToAnalytics(metric)
  })

  onCLS((metric) => {
    console.log('CLS:', metric.value, 'Target: <0.1')
    sendToAnalytics(metric)
  })
}

function sendToAnalytics(metric: any) {
  const { id, name, value, rating } = metric

  // Send to your analytics endpoint
  fetch('/api/analytics/vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      name,
      value,
      rating,
      url: window.location.pathname,
      timestamp: Date.now(),
    }),
  }).catch((error) => {
    console.error('Failed to send vitals:', error)
  })
}
```

```typescript title="apps/web/src/instrumentation-client.ts"
import { registerWebVitals } from './lib/web-vitals'

// Initialize web vitals tracking before React hydration
// This ensures we capture metrics from the earliest possible moment
registerWebVitals()
```

\*\*Note: Why instrumentation-client.ts?\*\*

The `instrumentation-client.ts` file runs **before React hydration begins**, making it the ideal place to initialize performance monitoring. This ensures you capture metrics from the earliest possible moment in the page lifecycle.

<https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client>

```typescript title="apps/web/src/app/api/analytics/vitals/route.ts"
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const vitals = await request.json()

    // Log to your analytics system (e.g., database, external service)
    console.log('Core Web Vitals:', vitals)

    // Store in database or forward to analytics service
    // await db.vitals.create({ data: vitals })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record vitals' }, { status: 500 })
  }
}
```

```bash title="Install dependencies"
pnpm add @vercel/speed-insights @vercel/analytics web-vitals
```

\*\*Warning: Working Directory\*\*

Run the installation command from the root of the monorepo, not inside `apps/web`. The package manager will handle workspace dependency installation.

\*\*Warning: Troubleshooting: No Console Logs Appearing?\*\*

If you don't see LCP, INP, or CLS logs in the console:

1. **Check file location:** `instrumentation-client.ts` must be in `apps/web/src/` (same level as `app/` folder), not inside `app/`.
2. **Check import path:** The import should be `./lib/web-vitals` (relative to `src/`).
3. **Restart dev server:** Changes to `instrumentation-client.ts` require a full restart, not just Fast Refresh.
4. **Check for errors:** Open DevTools Console and look for import errors or syntax issues.
5. **Wait for interaction:** INP only logs after you interact with the page (click, type). LCP logs after the largest content element renders.
6. **Production vs dev:** Some metrics behave differently in development. Deploy to Vercel for accurate field data.

\*\*Note: Core Web Vitals Explained\*\*

**LCP (Largest Contentful Paint):** How quickly main content loads. Target: < 2.5s. Optimize with image priority, preloading, CDN.

**INP (Interaction to Next Paint):** How quickly page responds to interactions. Target: < 200ms. Optimize with code splitting, reduce JavaScript execution.

**CLS (Cumulative Layout Shift):** Visual stability during loading. Target: < 0.1. Optimize with image/font space reservation, avoid injected content.

\*\*Warning: Google Uses Field Data Only\*\*

**Critical:** Google search ranking uses **field data** (real user measurements from Chrome) over 28-day window. Your Lighthouse lab score doesn't affect SEO ranking. Focus on real user Core Web Vitals, not synthetic scores.

**Field data collection:**

- Real users with Chrome browser (desktop and Android)
- 75th percentile over last 28 days
- Only "sufficiently popular" and "publicly discoverable" pages
- Mobile and desktop tracked separately

**Why it matters:** Improvements take up to 28 days to reflect in Google ranking. Use Vercel Speed Insights for real-time feedback.

\*\*Note: Core Web Vitals as UX Debugging Tool\*\*

Don't just chase rankings. **Core Web Vitals are actual UX metrics** that help you identify what needs debugging:

- LCP > 2.5s? Check image optimization, server response time.
- INP > 200ms? Reduce JavaScript execution, defer non-critical scripts.
- CLS > 0.1? Add image dimensions, font display strategies, avoid layout-shifting content.

\*\*Note: Turbopack for Development Performance\*\*

**Turbopack is the default bundler in Next.js 16+** and provides significant performance improvements for build-time and development workflows:

**Development Performance:**

- **Fast Refresh:** Significantly faster than Webpack in large codebases - improves dev loop productivity
- **HMR (Hot Module Replacement):** Instant feedback on code changes - reduces wait time between edits
- **Incremental compilation:** Only recompiles what changed - faster iteration cycles

**Production Build Impact:**

- **Faster builds:** Quicker production builds - shorter deployment cycles
- **Better tree-shaking:** More aggressive dead code elimination - smaller bundle sizes
- **Optimized chunks:** Smarter code splitting strategies

<https://nextjs.org/docs/app/api-reference/turbopack>

**Important:** Turbopack optimizes **build-time performance** (compilation speed, HMR, development experience). It does NOT directly improve **runtime Core Web Vitals** (LCP, INP, CLS), which measure user experience after the page loads.

**Indirect benefits:** Faster builds and smaller bundles from better tree-shaking can reduce JavaScript parse time, but CWV improvements come primarily from:

- Image optimization (next/image with priority prop)
- Font optimization (next/font)
- Code splitting and lazy loading
- Server Components and streaming
- Proper width/height attributes to prevent CLS

**Development velocity:** Faster builds mean more time optimizing performance, less time waiting for compilation.

## References

- <https://nextjs.org/docs/app/building-your-application/optimizing/analytics>
- <https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client>
- <https://web.dev/vitals/>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
