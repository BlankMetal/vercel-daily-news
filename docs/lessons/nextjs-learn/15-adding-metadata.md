# Chapter 15: Adding Metadata

Metadata is crucial for SEO and shareability. In this chapter, we'll discuss how you can add metadata to your Next.js application.

## In this chapter...

- What metadata is.
- Types of metadata.
- How to add an Open Graph image using metadata.
- How to add a favicon using metadata.

## What is metadata?

In web development, metadata provides additional details about a webpage. Metadata is not visible to the users visiting the page. Instead, it works behind the scenes, embedded within the page's HTML, usually within the `<head>` element. This hidden information is crucial for search engines and other systems that need to understand your webpage's content better.

## Why is metadata important?

Metadata plays a significant role in enhancing a webpage's SEO, making it more accessible and understandable for search engines and social media platforms. Proper metadata helps search engines effectively index webpages, improving their ranking in search results. Additionally, metadata like Open Graph improves the appearance of shared links on social media, making the content more appealing and informative for users.

## Types of metadata

**Title Metadata**: Responsible for the title of a webpage that is displayed on the browser tab.

```html
<title>Page Title</title>
```

**Description Metadata**: Provides a brief overview of the webpage content.

```html
<meta name="description" content="A brief description of the page content." />
```

**Keyword Metadata**: Includes the keywords related to the webpage content.

```html
<meta name="keywords" content="keyword1, keyword2, keyword3" />
```

**Open Graph Metadata**: Enhances the way a webpage is represented when shared on social media.

```html
<meta property="og:title" content="Title Here" />
<meta property="og:description" content="Description Here" />
<meta property="og:image" content="image_url_here" />
```

**Favicon Metadata**: Links the favicon to the webpage.

```html
<link rel="icon" href="path/to/favicon.ico" />
```

## Adding metadata

Next.js has a Metadata API that can be used to define your application metadata. There are two ways you can add metadata to your application:

- **Config-based**: Export a static `metadata` object or a dynamic `generateMetadata` function in a `layout.js` or `page.js` file.
- **File-based**: Next.js has a range of special files that are specifically used for metadata purposes:
  - `favicon.ico`, `apple-icon.jpg`, and `icon.jpg`: Utilized for favicons and icons
  - `opengraph-image.jpg` and `twitter-image.jpg`: Employed for social media images
  - `robots.txt`: Provides instructions for search engine crawling
  - `sitemap.xml`: Offers information about the website's structure

### Favicon and Open Graph image

In your `/public` folder, you'll notice you have two images: `favicon.ico` and `opengraph-image.jpg`.

Move these images to the root of your `/app` folder.

After doing this, Next.js will automatically identify and use these files as your favicon and OG image.

### Page title and descriptions

Include a `metadata` object from any `layout.js` or `page.js` file to add additional page information like title and description. Any metadata in `layout.js` will be inherited by all pages that use it.

In your root layout, create a new `metadata` object:

```typescript
// /app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acme Dashboard',
  description: 'The official Next.js Course Dashboard, built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout() {
  // ...
}
```

For specific pages, you can add a `metadata` object to override the parent:

```typescript
// /app/dashboard/invoices/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoices | Acme Dashboard',
};
```

Instead of repeating the title on every page, use `title.template` in the root layout:

```typescript
// /app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};
```

Now, in your `/dashboard/invoices` page:

```typescript
// /app/dashboard/invoices/page.tsx
export const metadata: Metadata = {
  title: 'Invoices',
};
```

The `%s` in the template will be replaced with the specific page title, resulting in `Invoices | Acme Dashboard`.

## Practice: Adding metadata

Add titles to your other pages:

1. `/login` page.
2. `/dashboard/` page.
3. `/dashboard/customers` page.
4. `/dashboard/invoices/create` page.
5. `/dashboard/invoices/[id]/edit` page.
