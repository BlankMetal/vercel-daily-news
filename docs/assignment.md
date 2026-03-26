# Vercel Partner Certification — Take-Home Assignment

## Assignment: Vercel Daily

Build a news publication website using Next.js 16 to demonstrate your understanding of modern React Server Component patterns, including the "use cache" directive, Suspense boundaries, Server Actions, and middleware/proxy for access control.

---

## Welcome

Welcome to the Vercel Partner Certification program! We're excited to have you as part of a select group of candidates working toward certification. As part of this program, you will complete the Next.js Foundations course through Vercel Academy, which will teach you the fundamental best practices of building with Next.js and shipping on Vercel. The Next.js Learn course is also a great companion resource as you build out your project.

We strongly encourage you to read through the entire assignment requirements below before starting the Foundations course. This way, you can apply what you're learning directly to the application you'll be building, and hit the ground running.

### Use of AI Coding Tools

You are welcome to consult AI coding assistants as a reference during this assignment — for example, to help generate a design or explore ideas. However, you are expected to write the code yourself. You must be able to fully explain your architecture decisions, implementation details, and how your solution adheres to Next.js 16 and Vercel best practices. Submissions that appear to be primarily AI-generated without demonstrated understanding may not pass the certification review.

---

## Overview

You will create a fictional "Vercel Daily" consisting of three pages and subscription functionality:

| Page | Route | Description |
| --- | --- | --- |
| **Homepage** | `/` | A news landing page with featured articles and a dynamic breaking news banner. |
| **Article Detail** | `/articles/[param]` | A dynamic route displaying individual article content with dynamically loaded trending articles. |
| **Search** | `/search` | A searchable article listing that performs server-side filtering with URL persistence. |
| **Subscription** | Session-based | Subscribe/unsubscribe mechanism with paywall enforcement for non-subscribers. |

> **Note on design:** You are free to make your own design choices regarding colors, typography, and visual styling. The focus of this assignment is on correct implementation of Next.js 16 features, not pixel-perfect design. However, your application should be polished, mobile-friendly, and provide a good user experience.

---

## General Site Requirements

| Component | Specification |
| --- | --- |
| **Header** | Persistent header containing a logo and navigation links to the Homepage and Search page. |
| **Footer** | Footer containing copyright text and year. |
| **Layout** | Shared root layout that renders the header and footer on all pages. |
| **Responsive Design** | The application must be mobile-friendly and work well across different viewport sizes. |
| **Root Metadata** | Define default metadata in the root layout that applies to all pages. |
| **Page-Specific Metadata** | Each page should export its own metadata that overrides or extends the root metadata. |
| **Open Graph** | Include Open Graph metadata (openGraph) for social sharing. |
| **Cache Components** | Cache Components are enabled. |

---

## Page 1: Homepage

**Route:** `/`

| Component | Specification |
| --- | --- |
| **Hero Section** | A prominent hero area with headline text, supporting description, and a visual element (featured story image or illustration). |
| **Breaking News Banner** | A banner displaying the latest breaking news or trending topic, fetched from the provided API. |
| **Featured Articles** | A grid displaying at least 6 articles fetched from the provided API. Each article should show its image, headline, category, publish date, and link to its detail page. |

---

## Page 2: Article Detail Page

**Route:** `/articles/[param]`

| Component | Specification |
| --- | --- |
| **Article Header** | The article headline, author name, publish date, and category. |
| **Featured Image** | A large hero image for the article. |
| **Article Content** | The full article body text. |
| **Trending Articles** | A section displaying 3-4 trending articles fetched dynamically from the provided API. |
| **Subscribe CTA** | If the user is not subscribed, display a call-to-action to subscribe. |

---

## Subscription & Paywall Functionality

| Component | Specification |
| --- | --- |
| **Subscribe Action** | Users can subscribe to Vercel Daily via a subscribe button. Authentication is not required — subscription is anonymous and it persists on page refresh. |
| **Subscription Indicator** | The header displays the user's subscription status (e.g., 'Subscribe' button when not subscribed, 'Subscribed' badge or 'Unsubscribe' option when subscribed). |
| **Unsubscribe Action** | Subscribed users can unsubscribe via an unsubscribe button or toggle. |
| **Session Persistence** | The subscription state persists within the same browser session using cookies. If the user refreshes the page or navigates away and returns, their subscription status should still be present. |
| **Paywall Enforcement** | Non-subscribed users attempting to view article detail pages are shown a paywalled version that does not render the full article content. |
| **Paywall UI** | The paywalled page shows the article headline, featured image, and a teaser (first paragraph or excerpt), followed by a prominent call-to-action to subscribe. |
| **Full Access for Subscribers** | Subscribed users see the complete article content without any paywall restrictions. |

---

## Page 3: Search Page

**Route:** `/search`

| Component | Specification |
| --- | --- |
| **Search Input** | A text input field for entering search queries. |
| **Category Filter** | A dropdown or select input allowing users to filter articles by category. |
| **Search Behavior** | Searches can be triggered by pressing Enter, clicking a search button, or automatically after the user has typed at least 3 characters. |
| **Default State** | When no search has been performed, display a default set of recent articles. |
| **Search Results** | When a search is performed, display up to 5 matching articles in a responsive grid layout. |
| **Empty State** | When a search returns no results, display an appropriate message. |
| **Loading State** | Visual feedback while a search is being performed. |
| **Persistent Search State** | If the user refreshes the page or shares the URL, the same search results should appear (including category filter). |

---

## API Reference

Full API documentation is available via the interactive Scalar docs. The documentation includes all available endpoints, request and response schemas, and example payloads.

**The API docs are password-protected.** Use the credentials below to access them:

- **Password:** `nextjs_youcanjustshipthings#2026`

---

## Deliverables

When your project is complete, submit the following:

1. **Public GitHub Repository** — A link to the public repository containing your source code. Ensure the repository is accessible so it can be reviewed.
2. **Deployed Application** — A public Vercel deployment URL (`*.vercel.app`) where your application can be accessed and tested.

Email both links to `alex.hawley@vercel.com`, `joey.malysz@vercel.com` and `partner.program@vercel.com` once you are ready for review.
