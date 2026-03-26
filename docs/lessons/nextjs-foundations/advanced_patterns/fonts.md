---
title: "Fonts (next/font)"
description: "Use `next/font` to self-host, subset, and set display/fallback strategies that minimize CLS and improve LCP."
canonical_url: "https://vercel.com/academy/nextjs-foundations/fonts-with-next-font"
md_url: "https://vercel.com/academy/nextjs-foundations/fonts-with-next-font.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-16T21:30:39.430Z"
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

# Fonts (next/font)

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Fonts (next/font)

Fonts can quietly wreck CLS. `next/font` self-hosts fonts, subsets to reduce size, and uses display strategies (swap, optional, block) to prevent layout shift and improve LCP.

## Outcome

Fonts loaded via `next/font` with appropriate display strategy, fallback configuration, and variable fonts for flexibility. Self-hosted and subset for performance, CLS prevention with size-adjust.

## Fast Track

1. Replace Google Fonts `<link>` with `next/font/google` import.
2. Configure display strategy: `swap` (show fallback, then custom), `optional` (skip if slow), `block` (wait briefly).
3. Use `adjustFontFallback` and variable fonts to reduce requests and prevent CLS.

## Hands-On Exercise 3.5

The starter repo uses default system fonts. Your task is to add optimized custom fonts.

**Requirements:**

1. Add `next/font/google` imports to `apps/web/src/app/layout.tsx`.
2. Use a variable font (e.g., Inter) to reduce requests and provide weight flexibility.
3. Configure `display: 'swap'` for immediate text visibility with fallback.
4. Enable `adjustFontFallback` for size-matched fallback to prevent CLS.
5. Subset to `['latin']` to reduce font file size.
6. Apply fonts via CSS variables for Tailwind integration.

**Implementation hints:**

- Display strategies:
  - `swap`: Show fallback immediately, swap when custom loads (recommended).
  - `optional`: Skip custom font if network slow - use fallback only.
  - `block`: Wait briefly for custom font, then swap (can delay text).
  - `fallback`: Brief wait, then fallback, swap when ready.
  - `auto`: Browser default behavior.
- Variable fonts provide all weights in single file - reduces requests.
- Subset to `['latin']` or specific character sets to reduce file size.
- Self-hosting automatic - no external requests to Google Fonts.
- `adjustFontFallback` uses size-adjust to match fallback metrics and prevent CLS.

\*\*Note: Need Help Choosing Font Display Strategy?\*\*

The display strategy affects when users see text vs when custom fonts load. Use this prompt to pick the right one:

```markdown title="Prompt: Choose Optimal Font Display Strategy"
<context>
I'm implementing fonts with next/font and need to choose the correct `display` strategy.
The display strategy controls how text renders during font loading: show fallback immediately, wait for custom font, or skip custom font if slow.
My site type: [e.g., content site, e-commerce, dashboard, marketing landing page]
</context>

<current-implementation>
    const inter = Inter({
      subsets: ['latin'],
      display: 'auto', // Current setting
    })
</current-implementation>

<site-characteristics>
Describe your site's priorities:
- **Content type:** [News articles, product pages, documentation, marketing copy]
- **User priority:** [Fast initial text visibility vs brand-consistent typography]
- **Network conditions:** [Target users on fast connections, mobile 3G, or mixed]
- **Typography importance:** [Critical for brand identity vs functional only]
- **Performance goals:** [Optimize for LCP, CLS prevention, or font loading speed]
</site-characteristics>

<questions>
1. **Text visibility:** Is it more important to show text immediately (even in fallback font) or wait for custom font?
2. **CLS prevention:** Does font size mismatch between fallback and custom cause layout shift?
3. **Brand consistency:** Is showing fallback font briefly acceptable, or must users always see custom font?
4. **Slow networks:** For users on 3G, should we skip custom fonts entirely to prioritize text visibility?
5. **Multiple fonts:** Should body text and headings use different display strategies?
</questions>

<specific-scenario>
Example site: E-commerce product pages
- Priority: Fast text visibility for product descriptions and prices
- Network: Mixed (desktop and mobile users)
- Brand: Custom font nice-to-have but not critical
- CLS: Must prevent layout shift from font loading

Recommendation: display: 'swap' with adjustFontFallback: true
- Shows text immediately in fallback (fast LCP)
- Swaps to custom when loaded (brand consistency)
- Size-matched fallback prevents CLS
</specific-scenario>

For my site characteristics, recommend the optimal display strategy (swap, optional, block, fallback, auto) with rationale based on user experience priorities, network conditions, and performance trade-offs.
```

This ensures your font loading strategy aligns with user experience goals and performance targets!

## Try It

1. **Verify self-hosting:**
   - Open Network tab, check no requests to fonts.googleapis.com or fonts.gstatic.com.
   - Fonts served from your domain at `/_next/static/media/`.

2. **Test CLS prevention:**
   - Throttle network to "Slow 3G" in DevTools.
   - Verify text renders with fallback, then swaps to custom font without layout shift.
   - CLS should remain < 0.1.

3. **Check font loading:**
   - Inspect `<style>` tag in HTML with `@font-face` declarations.
   - Verify display strategy applied: `font-display: swap`.
   - Check variable font includes multiple weights in single file.

## Commit & Deploy

```bash
git add -A
git commit -m "feat(advanced): optimize fonts with next/font and fallback"
git push -u origin feat/advanced-font-optimization
```

## Done-When

- [ ] DevTools Network tab: no requests to `fonts.googleapis.com` or `fonts.gstatic.com` (fonts self-hosted)
- [ ] Network tab: font files served from `/_next/static/media/` with hash in filename
- [ ] View page source: find `@font-face` with `font-display: swap` (or your chosen strategy)
- [ ] View page source: font file size reduced (subset to latin): look for WOFF2 files < 100KB
- [ ] Throttle to "Slow 3G", reload: text renders immediately in fallback font, then swaps to custom (no blank flash)
- [ ] Lighthouse Performance audit: CLS score < 0.1 (no layout shift from font swap)

\*\*Side Quest: Build a Font Loading Strategy Tester\*\*

## Solution

Click to reveal solution

Update the layout to import and configure fonts:

```typescript title="apps/web/src/app/layout.tsx"
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'

// Variable font - all weights in single file
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  adjustFontFallback: true,
})

// Monospace font for code blocks
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Vercel Academy Foundation - Web',
  description: 'VAF Web',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="container mx-auto px-4 py-8 font-sans">
        {children}
      </body>
    </html>
  )
}
```

Update globals.css to use the font variables with Tailwind 4's `@theme inline`:

```css title="apps/web/src/app/globals.css"
@import 'tailwindcss';

@import '@repo/ui/globals.css';

@theme inline {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  --font-mono: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}
```

\*\*Warning: Tailwind 4 Breaking Change\*\*

Tailwind 4 uses `@theme inline` instead of `@layer base` for font configuration. The `@layer base` approach no longer works because Tailwind's utility classes (like `font-sans`) override base layer styles. By using `@theme inline`, you're overriding Tailwind's default `--font-sans` and `--font-mono` CSS variables, so the `font-sans` utility class automatically uses your custom fonts.

### Local Fonts (Alternative)

If you need to use local font files instead of Google Fonts:

```typescript title="apps/web/src/app/layout.tsx (local fonts)"
import localFont from 'next/font/local'

const customFont = localFont({
  src: [
    {
      path: './fonts/custom-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/custom-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom',
  display: 'swap',
  adjustFontFallback: true,
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={customFont.variable}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
```

Then override Tailwind's font variables in your CSS:

```css title="apps/web/src/app/globals.css (local fonts)"
@import 'tailwindcss';

@theme inline {
  --font-sans: var(--font-custom), ui-sans-serif, system-ui, sans-serif;
}
```

\*\*Note: Display Strategies Explained\*\*

**`swap` (recommended):** Shows fallback text immediately, swaps to custom font when loaded. Best for most use cases - ensures text visible quickly.

**`optional`:** Custom font optional - if network slow, skip it entirely and use fallback. Best for performance-critical pages.

**`block`:** Brief invisible period while custom font loads (up to 3s), then swap. Can delay text visibility - use sparingly.

**`fallback`:** Brief invisible period, then show fallback, swap when custom loads. Compromise between `swap` and `block`.

**`auto`:** Browser default - usually similar to `block`.

\*\*Note: Variable Fonts Win\*\*

**Use variable fonts** instead of multiple static font files. Inter variable includes all weights (100-900) in a single file, reducing requests and improving performance compared to loading regular, medium, bold, etc. separately.

## References

- <https://nextjs.org/docs/app/getting-started/fonts>
- <https://nextjs.org/docs/app/api-reference/components/font>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
