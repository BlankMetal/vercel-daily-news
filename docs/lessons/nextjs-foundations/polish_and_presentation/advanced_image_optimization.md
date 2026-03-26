---
title: "Advanced Image Optimization"
description: "Master advanced next/image patterns: blur placeholders (low-resolution previews shown while images load) for perceived performance, art direction (serving different images based on viewport) with getImageProps, and srcset customization (controlling which image sizes are generated) with deviceSizes/imageSizes."
canonical_url: "https://vercel.com/academy/nextjs-foundations/advanced-image-optimization"
md_url: "https://vercel.com/academy/nextjs-foundations/advanced-image-optimization.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-18T19:30:19.917Z"
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

# Advanced Image Optimization

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Advanced Image Optimization

Users perceive pages as faster when they see *something* immediately, even if it's blurry. A 10px placeholder that fades into the full image feels instant, while a blank space that suddenly pops in feels jarring. Art direction (different images for mobile vs desktop) can cut mobile network bandwidth by 60% while improving visual impact. These advanced patterns separate polished production apps from basic implementations.

\*\*Note: Working Directory\*\*

This lesson uses `apps/web`. All file paths are relative to that directory.

\*\*Warning: Prerequisites\*\*

This lesson assumes you've completed [Images (next/image)](/03-advanced-patterns/images-next-image). You should already know how to use `next/image` with `fill`, `sizes`, `quality`, and `remotePatterns`. This lesson covers advanced patterns only.

## Outcome

Implement blur placeholders for perceived performance, use `getImageProps()` for art direction with the `<picture>` element, and configure `deviceSizes`/`imageSizes` to optimize srcset generation for your specific breakpoints.

## Fast Track

1. Add `placeholder="blur"` with a generated `blurDataURL` for remote images
2. Use `getImageProps()` with `<picture>` for mobile/desktop art direction
3. Configure `deviceSizes` and `imageSizes` in `next.config.ts` to match your design system

## Blur Placeholders for Perceived Performance

\*\*Note: Why Blur Placeholders Matter\*\*

Users perceive loading time based on visual feedback, not actual milliseconds. A blurred placeholder that fades into the full image feels 40% faster than a blank space, even with identical load times. This is the "skeleton screen" effect applied to images.

### Static Images: Automatic Blur

For statically imported images, Next.js automatically generates `blurDataURL`:

```tsx title="apps/web/src/app/about/page.tsx" {1,8}
import Image from "next/image";
import heroImage from "./hero.jpg"; // Static import

export default function AboutPage() {
  return (
    <Image
      src={heroImage}
      placeholder="blur" // blurDataURL auto-generated
      alt="Team photo"
      className="rounded-lg"
    />
  );
}
```

**What happens:**

- At build time, Next.js generates a tiny (10px) blurred version
- The blur displays immediately while the full image loads
- Smooth fade transition when full image is ready
- Zero runtime cost, all computed at build

### Remote Images: Manual blurDataURL

For remote/dynamic images, you must provide `blurDataURL` yourself:

```tsx title="apps/web/src/app/gallery/page.tsx" {12-13}
import Image from "next/image";

// Pre-generated blur placeholder (10x10 pixels, base64 encoded as text representation of binary data)
const blurDataURL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgcI/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDBAURAAYSIQcTMUH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRIf/aAAwDAQACEQMRAD8Aq9t3Bb7hU1FPBLIZYQDIrRMuAf3OdNNu+RbRa7XDQS1VY8kKhGkMBUMQMZxk4z+aUbf8d2i3XGorYpq1pZwA4aYEDA/MYGl+4/HdnulzqK2Kauikn5c1SYEKZxnGQDjP5rRVlYnJz//2Q==";

export default function GalleryPage() {
  return (
    <div className="relative aspect-video">
      <Image
        src="https://picsum.photos/1200/800"
        alt="Gallery image"
        fill
        placeholder="blur"
        blurDataURL={blurDataURL}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
```

### Generating blurDataURL at Runtime

For dynamic images (e.g., from a CMS), generate placeholders server-side:

```tsx title="apps/web/src/lib/image-utils.ts"
/**
 * Generate a simple color-based blur placeholder.
 * For production, use a library like plaiceholder for better results.
 */
export function generateColorPlaceholder(
  r: number,
  g: number,
  b: number
): string {
  // 1x1 pixel SVG with the dominant color
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="rgb(${r},${g},${b})" width="1" height="1"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// Usage: generateColorPlaceholder(59, 130, 246) → blue placeholder
```

\*\*Note: Production Placeholder Generation\*\*

For production apps, use [plaiceholder](https://github.com/joe-bell/plaiceholder) to generate proper blur placeholders from image URLs. It extracts dominant colors and creates optimized base64 placeholders.

````markdown title="Prompt: Generate Blur Placeholders for Remote Images"
I need blur placeholders (blurDataURL) for remote images in Next.js.

<context>
Static imports get automatic blur placeholders:
```tsx
import hero from './hero.jpg'
<Image src={hero} placeholder="blur" /> // Works automatically
```

Remote images need manual blurDataURL:
```tsx
<Image
  src="https://cdn.example.com/photo.jpg"
  placeholder="blur"
  blurDataURL="data:image/..." // Must provide this
/>
```
</context>

<my-situation>
**Image source:** _____
Example: "CMS API", "User uploads", "External CDN"

**When URLs are known:**
- [ ] Build time (static list of images)
- [ ] Runtime (dynamic, from API/database)

**Image types:** _____
Example: "Product photos", "User avatars", "Blog featured images"

**Volume:** ~_____ images
</my-situation>

<current-implementation>
```tsx
// How I'm currently loading images:
___PASTE_YOUR_IMAGE_CODE___
```
</current-implementation>

**Questions:**
1. Should I generate placeholders at build time or runtime?
2. Which library? (plaiceholder, sharp, thumbhash)
3. Where should I cache generated placeholders?
4. How do I avoid blocking page render?

Generate a production-ready blur placeholder system that:
- Works with my image source
- Includes caching strategy
- Integrates with next/image
- Doesn't hurt performance
````

## Art Direction with getImageProps()

\*\*Note: Art Direction vs Responsive Images\*\*

**Responsive images** (using `sizes`) serve the same image at different resolutions.
**Art direction** serves *different* images based on viewport, such as a landscape hero on desktop and a portrait crop on mobile.

The `getImageProps()` function extracts props for use with the native `<picture>` element:

```tsx title="apps/web/src/components/hero-image.tsx" {1,4-24}
import { getImageProps } from "next/image";

export function HeroImage() {
  const common = { alt: "Product showcase", sizes: "100vw" };

  // Desktop: wide landscape image
  const {
    props: { srcSet: desktop },
  } = getImageProps({
    ...common,
    width: 1440,
    height: 600,
    quality: 85,
    src: "/hero-desktop.jpg",
  });

  // Mobile: tall portrait image (different crop, not just smaller)
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({
    ...common,
    width: 750,
    height: 1000,
    quality: 75,
    src: "/hero-mobile.jpg",
  });

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktop} />
      <source media="(min-width: 640px)" srcSet={mobile} />
      <img {...rest} style={{ width: "100%", height: "auto" }} />
    </picture>
  );
}
```

**Why use art direction:**

- Mobile users get a portrait-optimized crop (better composition)
- Desktop users get a wide landscape (uses screen real estate)
- Different quality settings per device (mobile can use lower quality)
- Bandwidth savings: mobile image is 60% smaller than desktop

````markdown title="Prompt: Art Direction vs Responsive Images Decision"
I need to decide between responsive images and art direction for my Next.js app.

<context>
**Responsive images** (same image, different sizes):
```tsx
<Image src={photo} sizes="(max-width: 768px) 100vw, 50vw" />
```

**Art direction** (different images per breakpoint):
```tsx
<picture>
  <source media="(max-width: 768px)" srcSet={mobileImg} />
  <Image src={desktopImg} />
</picture>
```
</context>

<my-image>
**Image type:** _____
Example: "Hero banner", "Product photo", "Team headshot"

**Desktop version:**
- Dimensions: _____x_____
- What it shows: _____

**Mobile version (current):**
- What happens when desktop image is scaled down: _____
Example: "Important content gets cropped", "Text becomes unreadable", "Looks fine"

**The problem (if any):** _____
Example: "Product details too small on mobile", "Wrong aspect ratio looks awkward"
</my-image>

<current-implementation>
```tsx
// My current image code:
___PASTE_YOUR_IMAGE_CODE___
```
</current-implementation>

**Questions:**
1. Do I actually need art direction, or will responsive `sizes` work?
2. Is the UX improvement worth the extra complexity?
3. How do I handle this in my CMS/design workflow?

Help me decide:
- A) Stick with responsive (simpler, same image scales)
- B) Use art direction (complex, different crops/images)
- C) Hybrid (art direction for heroes only)

Include implementation code for whichever you recommend.
````

### Theme-Aware Images (Light/Dark Mode)

Use CSS media queries with `getImageProps()` for theme detection:

```tsx title="apps/web/src/components/theme-image.tsx"
import { getImageProps } from "next/image";
import styles from "./theme-image.module.css";

export function ThemeImage() {
  const {
    props: { srcSet: light, ...lightRest },
  } = getImageProps({
    src: "/logo-light.png",
    alt: "Logo",
    width: 200,
    height: 50,
  });

  const {
    props: { srcSet: dark, ...darkRest },
  } = getImageProps({
    src: "/logo-dark.png",
    alt: "Logo",
    width: 200,
    height: 50,
  });

  return (
    <>
      <img {...lightRest} srcSet={light} className={styles.light} />
      <img {...darkRest} srcSet={dark} className={styles.dark} />
    </>
  );
}
```

```css title="apps/web/src/components/theme-image.module.css"
.dark {
  display: none;
}

@media (prefers-color-scheme: dark) {
  .light {
    display: none;
  }
  .dark {
    display: unset;
  }
}
```

\*\*Warning: Don't Use preload with Theme Images\*\*

When using theme-aware images, avoid `preload` or `loading="eager"` because both images would load. Use `fetchPriority="high"` instead if the image is above the fold.

## Configuring deviceSizes and imageSizes

\*\*Note: How srcset Generation Works\*\*

Next.js combines `deviceSizes` and `imageSizes` to generate the `srcset` attribute. `deviceSizes` are for full-width images, `imageSizes` are for images smaller than the viewport. Together they determine which image widths are available.

### Default Configuration

```ts title="Default values (for reference)"
// deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
// imageSizes: [32, 48, 64, 96, 128, 256, 384]
```

### Custom Configuration for Your Design System

Match your Tailwind breakpoints and common image sizes:

```ts title="apps/web/next.config.ts" {4-16}
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Match Tailwind breakpoints: sm(640), md(768), lg(1024), xl(1280), 2xl(1536)
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],

    // Common thumbnail/avatar sizes in your design system
    imageSizes: [32, 48, 64, 96, 128, 192, 256],

    // Allowlist quality values (required in Next.js 16)
    qualities: [50, 75, 85, 100],

    // Modern formats
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
```

**Why customize:**

- **deviceSizes**: Align with your CSS breakpoints to avoid serving images between breakpoints
- **imageSizes**: Match your avatar/thumbnail sizes exactly (32px avatar, 96px card thumbnail)
- **qualities**: Restrict to values you actually use (prevents abuse of optimization API)

### Impact on Generated srcset

With default config, a responsive image generates:

```html
<img srcset="
  /_next/image?url=...&w=640&q=75 640w,
  /_next/image?url=...&w=750&q=75 750w,
  /_next/image?url=...&w=828&q=75 828w,
  ...
" />
```

With custom config matching Tailwind:

```html
<img srcset="
  /_next/image?url=...&w=640&q=75 640w,
  /_next/image?url=...&w=768&q=75 768w,
  /_next/image?url=...&w=1024&q=75 1024w,
  ...
" />
```

## Next.js 16: preload Replaces priority

\*\*Warning: Breaking Change in Next.js 16\*\*

The `priority` prop is **deprecated** in Next.js 16. Use `preload` instead for clearer semantics.

```tsx title="Migration example"
// ❌ Deprecated in Next.js 16
<Image src="/hero.jpg" alt="Hero" priority />

// ✅ Next.js 16+
<Image src="/hero.jpg" alt="Hero" preload />
```

**When to use `preload`:**

- The image is the Largest Contentful Paint (LCP) element
- The image is above the fold (visible without scrolling)
- You want the image to start loading in `<head>` before it's discovered in `<body>`

**When NOT to use `preload`:**

- Multiple images could be LCP depending on viewport (use `loading="eager"` instead)
- Below-the-fold images (let them lazy load)
- When using `loading` or `fetchPriority` props

## Hands-On Exercise 4.4

Implement advanced image optimization patterns in the gallery page.

**Target files:**

- `apps/web/src/app/gallery/page.tsx`
- `apps/web/next.config.ts`

**Requirements:**

1. Add blur placeholders to gallery images using `placeholder="blur"` with `blurDataURL`
2. Create a hero section with art direction: landscape on desktop, portrait on mobile
3. Configure `deviceSizes` to match Tailwind breakpoints
4. Configure `qualities` to allowlist only the values you use (75, 85)
5. Use `preload` (not `priority`) for the hero image

**Implementation hints:**

- Generate a simple color placeholder for remote images:
  ```tsx
  const blurDataURL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiM5Y2EzYWYiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=";
  ```
- Use `getImageProps()` for the art direction hero
- Test on mobile viewport to verify correct image loads

## Try It

1. **Verify blur placeholder:**
   - Throttle network to "Slow 3G" in DevTools
   - Reload the gallery page
   - Observe: blurred placeholder visible immediately, fades to full image

2. **Test art direction:**
   - Open DevTools → Network tab
   - Load page at desktop width (`>1024px`) → verify desktop image loads
   - Resize to mobile width (`<640px`) → reload → verify mobile image loads
   - Different images, not just different sizes

3. **Verify srcset matches config:**
   - Inspect a gallery image element
   - Check `srcset` attribute contains your configured widths (640, 768, 1024...)
   - Not the default widths (750, 828, 1080...)

## Commit & Deploy

```bash
git add -A
git commit -m "feat(images): add blur placeholders, art direction, custom srcset config"
git push -u origin feat/advanced-image-optimization
```

## Done-When

- [ ] Gallery images show blur placeholder on slow network (throttle to Slow 3G, reload, see blur before full image)
- [ ] Hero section uses `<picture>` element with different `srcSet` for mobile/desktop (inspect HTML)
- [ ] `next.config.ts` has custom `deviceSizes` matching Tailwind breakpoints (640, 768, 1024, 1280, 1536)
- [ ] `next.config.ts` has `qualities` array restricting allowed quality values
- [ ] Hero image uses `preload` prop (not deprecated `priority`)
- [ ] Network tab shows different hero image file loaded on mobile vs desktop viewport

## Solution

Complete advanced image optimization implementation

**1. Update next.config.ts with custom image configuration:**

```ts title="apps/web/next.config.ts"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
    // Match Tailwind breakpoints
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
    // Common UI sizes
    imageSizes: [32, 48, 64, 96, 128, 192, 256],
    // Restrict quality values (required in Next.js 16)
    qualities: [75, 85],
    // Modern formats
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
```

**2. Create the gallery page with blur placeholders and art direction:**

```tsx title="apps/web/src/app/gallery/page.tsx"
import Image, { getImageProps } from "next/image";

// Simple gray blur placeholder (base64 encoded 1x1 SVG)
const blurDataURL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IGZpbGw9IiM5Y2EzYWYiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4=";

const galleryImages = [
  { src: "https://picsum.photos/800/600?random=1", alt: "Mountain landscape" },
  { src: "https://picsum.photos/800/600?random=2", alt: "Ocean sunset" },
  { src: "https://picsum.photos/800/600?random=3", alt: "Forest path" },
  { src: "https://picsum.photos/800/600?random=4", alt: "City skyline" },
];

function HeroWithArtDirection() {
  const common = { alt: "Featured landscape", sizes: "100vw" };

  // Desktop: wide landscape
  const {
    props: { srcSet: desktop },
  } = getImageProps({
    ...common,
    width: 1440,
    height: 600,
    quality: 85,
    src: "https://picsum.photos/1440/600?random=hero-desktop",
  });

  // Mobile: taller aspect ratio
  const {
    props: { srcSet: mobile, ...rest },
  } = getImageProps({
    ...common,
    width: 750,
    height: 900,
    quality: 75,
    src: "https://picsum.photos/750/900?random=hero-mobile",
  });

  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktop} />
      <source media="(min-width: 640px)" srcSet={mobile} />
      <img
        {...rest}
        fetchPriority="high"
        style={{ width: "100%", height: "auto" }}
        className="rounded-lg"
      />
    </picture>
  );
}

export default function GalleryPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 font-bold text-3xl">Photo Gallery</h1>

      {/* Hero with art direction */}
      <section className="mb-8">
        <HeroWithArtDirection />
      </section>

      {/* Gallery grid with blur placeholders */}
      <div className="grid grid-cols-2 gap-4">
        {galleryImages.map((image, i) => (
          <div key={i} className="relative aspect-[4/3]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              quality={75}
              placeholder="blur"
              blurDataURL={blurDataURL}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-lg object-cover"
            />
          </div>
        ))}
      </div>

      <section className="mt-8 rounded bg-blue-50 p-4">
        <h2 className="mb-2 font-semibold text-blue-800">
          Advanced Optimizations Applied
        </h2>
        <ul className="list-inside list-disc text-blue-700 text-sm">
          <li>Blur placeholders for perceived performance</li>
          <li>Art direction: different hero images for mobile/desktop</li>
          <li>Custom deviceSizes matching Tailwind breakpoints</li>
          <li>Quality values restricted to 75, 85</li>
          <li>AVIF/WebP format optimization</li>
        </ul>
      </section>
    </main>
  );
}
```

**Key advanced patterns implemented:**

1. **Blur placeholders**: `placeholder="blur"` with `blurDataURL` for remote images
2. **Art direction**: `getImageProps()` with `<picture>` element for mobile/desktop
3. **Custom srcset**: `deviceSizes` aligned with Tailwind breakpoints
4. **Quality restriction**: `qualities` array limits allowed values
5. **fetchPriority**: Used instead of deprecated `priority` for art direction hero

**Verify the implementation:**

1. **Blur placeholder**: Throttle to Slow 3G, reload, see gray blur before images
2. **Art direction**: Resize browser, check Network tab for different hero images
3. **srcset**: Inspect image element, verify widths match your deviceSizes config

## Advanced Image Optimization Checklist

| Pattern             | When to Use                           | Implementation                        |
| ------------------- | ------------------------------------- | ------------------------------------- |
| Blur placeholder    | Remote/dynamic images                 | `placeholder="blur"` + `blurDataURL`  |
| Art direction       | Different crops for mobile/desktop    | `getImageProps()` + `<picture>`       |
| Custom deviceSizes  | Match your CSS breakpoints            | `next.config.ts` images config        |
| Custom imageSizes   | Match your avatar/thumbnail sizes     | `next.config.ts` images config        |
| Quality restriction | Prevent API abuse, control file sizes | `qualities` array in config           |
| Theme images        | Light/dark mode logos                 | CSS media queries + `getImageProps()` |

**Performance impact:**

- Blur placeholders: 40% better perceived load time
- Art direction: 60% bandwidth savings on mobile
- Custom srcset: Eliminates between-breakpoint waste
- Quality restriction: Prevents 100% quality abuse

\*\*Side Quest: Automated Blur Placeholder Generator\*\*

## References

- <https://nextjs.org/docs/app/api-reference/components/image>
- <https://nextjs.org/docs/app/api-reference/components/image#getimageprops>
- <https://nextjs.org/docs/app/api-reference/components/image#devicesizes>
- <https://nextjs.org/docs/app/api-reference/components/image#placeholder>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
