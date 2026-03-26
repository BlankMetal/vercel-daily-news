# Vercel Daily News API Reference

**Version:** 2.0.0 | **OpenAPI:** 3.1.1

A RESTful API for browsing the Vercel Daily News publication and managing newsletter subscriptions.

---

## Base URL

```
https://vercel-daily-news-api.vercel.app/api
```

## Authentication

All requests require the `x-vercel-protection-bypass` header:

```ts
const res = await fetch("https://vercel-daily-news-api.vercel.app/api/articles", {
  headers: {
    "x-vercel-protection-bypass": "OykROcuULI6YJwAwk3VnWv4gMMbpAq6q",
  },
});
const data = await res.json();
```

Without it, all requests return `403 Forbidden`.

---

## Quick Start

**Step 1: Browse featured articles**

```bash
curl https://vercel-daily-news-api.vercel.app/api/articles?featured=true \
  -H "x-vercel-protection-bypass: OykROcuULI6YJwAwk3VnWv4gMMbpAq6q"
```

**Step 2: Get article details**

```bash
curl https://vercel-daily-news-api.vercel.app/api/articles/building-secure-ai-agents \
  -H "x-vercel-protection-bypass: OykROcuULI6YJwAwk3VnWv4gMMbpAq6q"
```

**Step 3: Get trending articles**

```bash
curl https://vercel-daily-news-api.vercel.app/api/articles/trending \
  -H "x-vercel-protection-bypass: OykROcuULI6YJwAwk3VnWv4gMMbpAq6q"
```

**Step 4: Create a subscription**

```bash
curl -X POST https://vercel-daily-news-api.vercel.app/api/subscription/create -v \
  -H "x-vercel-protection-bypass: OykROcuULI6YJwAwk3VnWv4gMMbpAq6q"
# Look for the x-subscription-token header in the response
```

**Step 5: Activate the subscription**

```bash
curl -X POST https://vercel-daily-news-api.vercel.app/api/subscription \
  -H "x-subscription-token: <your-token>" \
  -H "x-vercel-protection-bypass: OykROcuULI6YJwAwk3VnWv4gMMbpAq6q"
```

**Step 6: Check subscription status**

```bash
curl https://vercel-daily-news-api.vercel.app/api/subscription \
  -H "x-subscription-token: <your-token>" \
  -H "x-vercel-protection-bypass: OykROcuULI6YJwAwk3VnWv4gMMbpAq6q"
```

---

## Subscription Tokens

Subscriptions are identified by anonymous tokens. When you create a subscription via `POST /api/subscription/create`, the response includes an `x-subscription-token` header. Store this token and include it in all subsequent subscription requests as the `x-subscription-token` header.

Subscription tokens expire after **24 hours** of inactivity.

---

## Response Format

All responses follow a consistent envelope:

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "meta": { "pagination": { ... } }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Article with id 'xyz' not found"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
| --- | --- | --- |
| `VALIDATION_ERROR` | 422 | Invalid request body or query parameters |
| `BAD_REQUEST` | 400 | Missing required headers or malformed request |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## Endpoints

### Articles

#### `GET /articles` — List articles

Returns a paginated list of articles. Supports filtering by category, search term, and featured status.

**Query Parameters:**

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | integer (min: 1) | `1` | Page number |
| `limit` | integer (1–100) | `20` | Items per page |
| `category` | string | — | Filter by category slug: `changelog`, `engineering`, `customers`, `company-news`, `community` |
| `search` | string | — | Search articles by title, excerpt, or tags |
| `featured` | `"true"` \| `"false"` | — | Filter by featured status |

**Response:** `200` — Paginated article list

```json
{
  "success": true,
  "data": [
    {
      "id": "4eUawbAqhHBg0OzTSNeLwv",
      "title": "Vercel Domains overhauled with instant search and at-cost pricing",
      "slug": "vercel-domains-overhauled-with-instant-search-and-at-cost-pricing",
      "excerpt": "We've rebuilt Vercel Domains end to end...",
      "content": [{ "type": "paragraph", "text": "..." }],
      "category": "changelog",
      "author": { "name": "Rhys Sullivan", "avatar": "" },
      "image": "https://i8qy5y6gxkdgdcv9.public.blob.vercel-storage.com/news/vercel-domains-overhauled-with-instant-search-and-at-cost-pricing.png",
      "publishedAt": "2025-09-25T00:00:00.000-05:00",
      "featured": false,
      "tags": ["Vercel Domains"]
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 18,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

**Errors:** `422` — Validation error

---

#### `GET /articles/{id}` — Get article details

Returns a single article by its ID or slug.

**Path Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | string (required) | Article ID (e.g. `4eUawbAqhHBg0OzTSNeLwv`) or slug (e.g. `building-secure-ai-agents`) |

**Response:** `200` — Article details

**Errors:** `404` — Article not found

---

### Trending

#### `GET /articles/trending` — Get trending articles

Returns 4 randomly selected trending articles. Results change on every request.

**Query Parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `exclude` | string | Comma-separated list of article IDs to exclude |

**Response:** `200` — Array of trending articles

---

### Categories

#### `GET /categories` — List all categories

Returns all article categories with their article counts.

**Response:** `200`

```json
{
  "success": true,
  "data": [
    { "slug": "changelog", "name": "Changelog", "articleCount": 4 },
    { "slug": "engineering", "name": "Engineering", "articleCount": 3 },
    { "slug": "customers", "name": "Customers", "articleCount": 3 },
    { "slug": "company-news", "name": "Company News", "articleCount": 5 },
    { "slug": "community", "name": "Community", "articleCount": 3 }
  ]
}
```

---

### Breaking News

#### `GET /breaking-news` — Get breaking news

Returns a randomly selected breaking news item. May return a different item on each request.

**Response:** `200`

```json
{
  "success": true,
  "data": {
    "id": "breaking_001",
    "headline": "Vercel Introduces the AI Cloud Platform",
    "summary": "The same principles and ease of use you expect from Vercel, now for your agentic applications.",
    "articleId": "3wYz2UxP8JRMZ9yNmvbFqv",
    "category": "company-news",
    "publishedAt": "2025-07-10T09:00:00Z",
    "urgent": true
  }
}
```

---

### Subscription

#### `POST /subscription/create` — Create a new subscription

Creates a new inactive subscription. The response includes the subscription token in the `x-subscription-token` **response header**. Store this token for subsequent requests.

**Response:** `201` — New subscription created (includes `x-subscription-token` header)

---

#### `GET /subscription` — Get subscription status

Retrieves the current subscription status.

**Required Headers:**

| Header | Type | Description |
| --- | --- | --- |
| `x-subscription-token` | string (uuid) | The subscription token |

**Response:** `200` — Subscription status

**Errors:** `400` — Missing token | `404` — Subscription not found or expired

---

#### `POST /subscription` — Activate subscription

Activates the subscription (sets status to `active`).

**Required Headers:** `x-subscription-token`

**Response:** `200` — Subscription activated

**Errors:** `400` — Missing token | `404` — Subscription not found

---

#### `DELETE /subscription` — Deactivate subscription

Deactivates the subscription (sets status to `inactive`).

**Required Headers:** `x-subscription-token`

**Response:** `200` — Subscription deactivated

**Errors:** `400` — Missing token | `404` — Subscription not found

---

### Publication

#### `GET /publication/config` — Get publication configuration

Returns publication configuration including enabled features, social links, and SEO defaults.

**Response:** `200`

```json
{
  "success": true,
  "data": {
    "publicationName": "Vercel Daily News",
    "language": "en",
    "features": {
      "newsletter": true,
      "bookmarks": true,
      "comments": true,
      "darkMode": true,
      "searchSuggestions": true
    },
    "socialLinks": {
      "twitter": "https://twitter.com/vercel",
      "github": "https://github.com/vercel",
      "discord": "https://discord.gg/vercel"
    },
    "seo": {
      "defaultTitle": "Vercel Daily News",
      "titleTemplate": "%s | Vercel Daily News",
      "defaultDescription": "The latest news, tutorials, and insights for modern web developers."
    }
  }
}
```

---

### Health

#### `GET /health` — Health check

Returns the health status of the API and its dependent services.

**Response:** `200`

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-01-15T12:00:00Z",
    "services": {
      "redis": "connected"
    }
  }
}
```

---

## Data Models

### Article

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Unique article ID |
| `title` | string | Article headline |
| `slug` | string | URL-friendly slug |
| `excerpt` | string | Short summary |
| `content` | ContentBlock[] | Structured content blocks |
| `category` | string | Category slug |
| `author` | `{ name: string, avatar: string }` | Author info |
| `image` | string (uri) | Featured image URL |
| `publishedAt` | string (date-time) | Publication date |
| `featured` | boolean | Whether featured on homepage |
| `tags` | string[] | Article tags |

### ContentBlock

| Type | Fields | Description |
| --- | --- | --- |
| `paragraph` | `text: string` | A paragraph of text |
| `heading` | `level: 2 \| 3`, `text: string` | A section heading (h2 or h3) |
| `blockquote` | `text: string` | A highlighted quote |
| `unordered-list` | `items: string[]` | A bulleted list |
| `ordered-list` | `items: string[]` | A numbered list |
| `image` | `src: string`, `alt: string`, `caption?: string` | An image with optional caption |

**Example renderer:**

```tsx
function ArticleContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <article>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return <p key={i}>{block.text}</p>
          case "heading":
            return block.level === 2
              ? <h2 key={i}>{block.text}</h2>
              : <h3 key={i}>{block.text}</h3>
          case "blockquote":
            return <blockquote key={i}>{block.text}</blockquote>
          case "unordered-list":
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )
          case "ordered-list":
            return (
              <ol key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            )
          case "image":
            return (
              <figure key={i}>
                <img src={block.src} alt={block.alt} />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            )
        }
      })}
    </article>
  )
}
```

### BreakingNews

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Breaking news item ID |
| `headline` | string | Headline text |
| `summary` | string | Short summary |
| `articleId` | string | Related article ID |
| `category` | string | Category slug |
| `publishedAt` | string (date-time) | Publication date |
| `urgent` | boolean | Whether this is urgent |

### Subscription

| Field | Type | Description |
| --- | --- | --- |
| `token` | string (uuid) | Subscription token |
| `status` | `"active"` \| `"inactive"` | Current status |
| `subscribedAt` | string (date-time, nullable) | When subscribed |
| `createdAt` | string (date-time) | When created |
| `updatedAt` | string (date-time) | Last updated |

### Category

| Field | Type | Description |
| --- | --- | --- |
| `slug` | string | Category slug |
| `name` | string | Display name |
| `articleCount` | integer | Number of articles |

### Pagination

| Field | Type | Description |
| --- | --- | --- |
| `page` | integer | Current page |
| `limit` | integer | Items per page |
| `total` | integer | Total items |
| `totalPages` | integer | Total pages |
| `hasNextPage` | boolean | Whether there's a next page |
| `hasPreviousPage` | boolean | Whether there's a previous page |
