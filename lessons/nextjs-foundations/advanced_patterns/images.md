---
title: "Images (next/image)"
description: "Use `next/image` to reserve space, optimize formats, lazy-load, and prioritize the LCP image."
canonical_url: "https://vercel.com/academy/nextjs-foundations/images-next-image"
md_url: "https://vercel.com/academy/nextjs-foundations/images-next-image.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-16T21:11:29.702Z"
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

# Images (next/image)

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Images (next/image)

Your hero image is 2.4MB and takes 6 seconds to load on mobile. Your gallery causes layout shift every time an image pops in, shoving content around and frustrating users. Lighthouse screams about LCP and CLS.

You could manually resize images, convert formats, add loading attributes, calculate sizes... or let `next/image` handle all of it automatically.

## Outcome

A hero image with `priority` for LCP optimization, a responsive gallery with correct `sizes` prop, and zero CLS from images. Automatic format optimization and lazy loading for below-fold images.

## Fast Track

1. Replace `<img>` with `<Image>` from `next/image`.
2. Add `priority` to hero/LCP images to preload immediately.
3. Set `sizes` prop for responsive images and reserve space with `width`/`height` or `fill`.

## Hands-On Exercise 3.4

The starter repo includes a gallery page at `apps/web/src/app/gallery/page.tsx` with raw `<img>` tags. Your task is to optimize it.

**Requirements:**

1. Convert the gallery images in `apps/web/src/app/gallery/page.tsx` from `<img>` to `<Image>`.
2. Add a hero image with `priority` prop for LCP optimization.
3. Set `sizes` prop correctly for the 2-column grid layout.
4. Configure `remotePatterns` in `next.config.ts` for the external image source (picsum.photos).
5. Use `fill` with aspect ratio container to reserve space and prevent CLS.

**Implementation hints:**

- `priority` prop preloads above-fold images (LCP candidates).
- Lazy loading automatic for below-fold images.
- `sizes` prop tells browser which image size to fetch: `"(max-width: 768px) 100vw, 50vw"`.
- Quality 75-85 is sweet spot - 100 wastes bandwidth with minimal visual gain.
- Space reservation with `width`/`height` or `fill` with container prevents CLS.
- Use `remotePatterns` in `next.config.ts` for external images.
- Automatic format optimization: WebP, AVIF based on browser support.

\*\*Note: Need Help Calculating sizes Prop?\*\*

The `sizes` prop is critical for responsive images but often confusing. Use this prompt to calculate the optimal value:

```markdown title="Prompt: Calculate Optimal sizes Prop"
<context>
I'm implementing responsive images with next/image and need to set the `sizes` prop correctly.
The `sizes` prop tells the browser which image size to fetch based on viewport width.
My layout: [describe your layout - e.g., full-width hero, 3-column grid, sidebar with main content]
</context>

<current-layout>
Describe your responsive layout at different breakpoints:
- Mobile (< 768px): [How wide is the image? e.g., full width, 2-column grid]
- Tablet (768px - 1024px): [How wide is the image? e.g., 50% width, 3-column grid]
- Desktop (> 1024px): [How wide is the image? e.g., 33% width, 4-column grid]
- Max container width: [e.g., 1200px, 1440px, or full viewport]
</current-layout>

<current-attempt>
My current sizes prop (if any):
    sizes="(max-width: 768px) 100vw, 50vw"
</current-attempt>

<questions>
1. **Grid calculations:** For a 3-column grid on desktop, is the correct value `33vw` or should I account for gaps?
2. **Container constraints:** If my max-width is 1200px, how do I express "full width of container" in sizes?
3. **Multiple breakpoints:** How do I combine multiple conditions for mobile, tablet, and desktop?
4. **Fill vs fixed:** When using `fill` prop, does my sizes calculation change?
5. **Over-fetching:** How do I avoid fetching images larger than they'll ever display?
</questions>

<specific-scenario>
Example layout:
- Mobile (< 640px): Single column, image is 100% width
- Tablet (640px - 1024px): 2 columns with 16px gap, image is ~48% width
- Desktop (> 1024px): 4 columns with 24px gap, image is ~23% width
- Max container: 1200px centered

Expected sizes calculation that accounts for container max-width and grid gaps.
</specific-scenario>

Generate the optimal `sizes` prop for my layout with explanation of each breakpoint calculation. Include calculations for grid gaps and container constraints to minimize over-fetching.
```

This ensures you fetch the right image size for each viewport, improving performance without sacrificing quality!

\*\*Note: Optional: Generate with v0\*\*

Use v0 to scaffold the gallery/card markup only. Replace any raw `<img>` with `next/image` in our codebase and add correct `sizes`.

Prompt:

```text
Generate a responsive image card grid using Tailwind with title and description no data fetching presentational only reserve space for images.
```

Open in v0: [Open in v0](https://v0.app?q=Generate%20a%20responsive%20image%20card%20grid%20using%20Tailwind%20with%20title%20and%20description%20no%20data%20fetching%20presentational%20only%20reserve%20space%20for%20images.)

## Try It

1. **Measure LCP improvement:**
   - Open DevTools Performance tab, record page load.
   - Verify hero image is LCP element and loads quickly with `priority`.
   - Target: LCP < 2.5s.

2. **Verify CLS = 0:**
   - Throttle network to "Slow 3G" in DevTools.
   - Scroll through page - no layout shift as images load.
   - Space reserved with `width`/`height` or `fill` with container.

3. **Check format optimization:**
   - Open Network tab, inspect image requests.
   - Verify WebP or AVIF format served (not JPEG/PNG).
   - Responsive sizes match viewport with correct `sizes` prop.

## Commit & Deploy

```bash
git add -A
git commit -m "feat(advanced): optimize images with next/image and sizes"
git push -u origin feat/advanced-image-optimization
```

## Done-When

- [ ] View page source: find `<link rel="preload" ... fetchpriority="high">` for hero image (confirms `priority` prop works)
- [ ] Open DevTools Network tab: hero image loads early in waterfall, before other images
- [ ] Gallery images show correct responsive loading: resize browser and verify smaller images fetched on mobile viewports
- [ ] DevTools Network tab: images served as `image/webp` or `image/avif` (not jpg/png) from `/_next/image`
- [ ] Lighthouse Performance audit: CLS score shows 0 or < 0.1 for images (no layout shift during load)
- [ ] Throttle to "Slow 3G" and scroll: below-fold gallery images lazy load as they enter viewport (not all at once)

\*\*Side Quest: Create an Adaptive Image Component\*\*

## Solution

Click to reveal solution

First, configure remote patterns for the external image source:

```typescript title="apps/web/next.config.ts"
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

export default config
```

Then convert the gallery page to use `next/image`:

```typescript title="apps/web/src/app/gallery/page.tsx"
import Image from 'next/image'

const images = [
  { src: 'https://picsum.photos/800/600?random=1', alt: 'Mountain landscape' },
  { src: 'https://picsum.photos/800/600?random=2', alt: 'Ocean sunset' },
  { src: 'https://picsum.photos/800/600?random=3', alt: 'Forest path' },
  { src: 'https://picsum.photos/800/600?random=4', alt: 'City skyline' },
]

export default function GalleryPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 font-bold text-3xl">Photo Gallery</h1>

      {/* Hero image with priority for LCP */}
      <div className="relative mb-8 aspect-video w-full">
        <Image
          src="https://picsum.photos/1200/600?random=hero"
          alt="Featured landscape"
          fill
          priority // Preload for LCP optimization
          quality={85}
          sizes="(max-width: 896px) 100vw, 896px"
          className="rounded-lg object-cover"
        />
      </div>

      {/* Gallery grid with responsive images */}
      <div className="grid grid-cols-2 gap-4">
        {images.map((image, i) => (
          <div key={i} className="relative aspect-[4/3]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              quality={80}
              sizes="(max-width: 768px) 50vw, 400px"
              className="rounded-lg object-cover"
              // Lazy loading automatic for below-fold images
            />
          </div>
        ))}
      </div>

      <section className="mt-8 rounded bg-green-100 p-4">
        <h2 className="mb-2 font-semibold text-green-800">Performance Optimizations Applied</h2>
        <ul className="list-inside list-disc text-green-700 text-sm">
          <li>Images served as WebP/AVIF from /_next/image</li>
          <li>Hero preloaded with priority prop</li>
          <li>Responsive sizes prevent over-fetching</li>
          <li>Space reserved with fill + aspect ratio (no CLS)</li>
          <li>Below-fold images lazy load automatically</li>
        </ul>
      </section>
    </main>
  )
}
```

\*\*Warning: Don't Use images.domains\*\*

**`images.domains` is deprecated.** Use `remotePatterns` instead for better security and control:

```typescript
// ✅ CORRECT
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cdn.acme.com',
      pathname: '/images/**' // Optional: restrict to specific paths
    },
    {
      protocol: 'https',
      hostname: '**.example.com' // Wildcard for subdomains
    }
  ]
}
```

`remotePatterns` provides better security by restricting protocols and paths for external images.

\*\*Warning: Never Use next/legacy/image\*\*

**`next/legacy/image` has been removed.** Use `next/image` with proper `width`/`height` or `fill` prop.

\*\*Note: Quality Sweet Spot: 75-85\*\*

**Don't use quality=** - wastes bandwidth with minimal visual improvement. Quality 75-85 provides excellent visual quality at much smaller file sizes. Test your specific images to find the sweet spot.

\*\*Note: Priority vs Lazy Loading\*\*

**Above-fold (LCP candidates):** Use `priority` to preload immediately.
**Below-fold:** Omit `priority` for automatic lazy loading as user scrolls.
**Space reservation:** Always provide `width`/`height` or use `fill` with container aspect ratio to prevent CLS.

## References

- <https://nextjs.org/docs/app/getting-started/images>
- <https://nextjs.org/docs/app/api-reference/components/image>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
