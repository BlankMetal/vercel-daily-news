---
title: "Security Review: APIs and Config"
description: "Harden API routes or Server Actions with validation, auth checks, and proper secret handling."
canonical_url: "https://vercel.com/academy/nextjs-foundations/security-review-apis-and-config"
md_url: "https://vercel.com/academy/nextjs-foundations/security-review-apis-and-config.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-17T21:23:55.321Z"
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

# Security Review: APIs and Config

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Security Review: APIs and Config

Production security breaches are expensive and embarrassing. A single exposed API key or unvalidated input can compromise your entire application. The most common vulnerabilities come from missing authentication, no input validation, and accidentally exposing secrets to the client.

## Outcome

A hardened API route or Server Action with five critical security layers: authentication, input validation, authorization, rate limiting, and error handling.

\*\*Note: Working Directory\*\*

This lesson uses `apps/web`. All file paths are relative to that directory.

## Fast Track

1. Add Zod schema validation (a TypeScript-first library for validating and parsing data) and authentication checks to API routes
2. Audit environment variables; remove NEXT\_PUBLIC\_ from secrets
3. Replace stack trace responses with generic error messages

## Common Vulnerabilities

\*\*Warning: 5 Critical Security Gaps\*\*

Most API security breaches start with these five missing safeguards:

1. ❌ **No Authentication** - Anyone can call your API
2. ❌ **No Input Validation** - Malicious data reaches your database
3. ❌ **No Authorization** - Users can access other users' data
4. ❌ **No Rate Limiting** - Vulnerable to spam and DDoS attacks
5. ❌ **No Error Handling** - Stack traces (detailed error information showing code execution paths) exposed to attackers

\*\*Note: Need Help Auditing Your API Security?\*\*

Unsure how to systematically audit your existing routes for security vulnerabilities? Use this structured prompt to identify critical gaps:

```markdown title="Prompt: Generate Security Audit Script"
<context>
I'm auditing API routes and Server Actions in a Next.js application for the 5 critical security layers:
1. Authentication (verify user identity)
2. Input validation (Zod schema checks)
3. Authorization (user can only access own data)
4. Rate limiting (prevent spam/DDoS)
5. Error handling (no stack trace leaks)

My project structure:
- API routes in: apps/web/src/app/api/**/*.ts
- Server Actions in: apps/web/src/app/actions/**/*.ts
- Auth utils in: apps/web/src/lib/auth.ts
</context>

<current-implementation>
I have multiple API routes and Server Actions but haven't systematically checked them against the 5-layer security model. Some routes may be missing authentication, validation, or proper error handling.
</current-implementation>

<questions>
1. **Audit script structure:** Should I create a Node.js script that:
   - Parses all route files and Server Action files?
   - Checks for presence of auth imports (verifyAuth, getServerSession)?
   - Detects Zod schema usage for validation?
   - Flags missing try/catch blocks or generic error responses?

2. **Detection patterns:** What code patterns reliably indicate:
   - Missing authentication (no verifyAuth() call before operations)?
   - Missing validation (direct await request.json() without Zod parse)?
   - Authorization gaps (no user.id === requestedId checks)?
   - Unsafe error handling (raw error.message in responses)?

3. **Output format:** Should the audit report show:
   - Per-file checklist of the 5 security layers?
   - Severity ratings (critical, high, medium)?
   - Code snippets showing the vulnerable patterns?
   - Prioritized fix recommendations?

4. **Rate limiting detection:** How do I check if routes implement rate limiting?
   - Look for imports like checkRateLimit(), rateLimit()?
   - Check for middleware like rateLimitMiddleware?
   - Flag all routes without rate limit calls as vulnerable?

5. **False positives:** How do I avoid flagging:
   - Public endpoints that intentionally don't need auth (e.g., /api/health)?
   - Read-only operations that may have different security requirements?
   - Routes that use authentication middleware instead of inline checks?
</questions>

<specific-scenario>
Example API route that should be flagged:

    export async function POST(request: Request) {
      const { userId, amount } = await request.json()
      await db.transactions.create({ userId, amount })
      return Response.json({ success: true })
    }

Expected audit findings:
- Missing: Authentication check
- Missing: Input validation (Zod schema)
- Missing: Authorization check
- Missing: Rate limiting
- Missing: Error handling (try/catch)
- Severity: CRITICAL
- Recommendation: Add all 5 security layers before deploying
</specific-scenario>

Generate a Node.js audit script that scans my Next.js codebase for these security gaps, produces a structured report with severity ratings and code snippets, and prioritizes fixes by impact.
```

This prompt will help you build an automated security scanner that catches vulnerabilities before they reach production.

### Vulnerable API Route Example

```tsx title="apps/web/src/app/api/transactions/route.ts"
// ❌ DANGEROUS: Missing all five security layers
export async function POST(request: Request) {
  const { userId, amount } = await request.json()

  await db.transactions.create({
    userId,
    amount,
    timestamp: Date.now()
  })

  return Response.json({ success: true })
}
```

**What's wrong:**

- No authentication check - anyone can create transactions
- No validation - could accept negative amounts or malicious userId
- No authorization - users could create transactions for other users
- No rate limiting - attackers can spam the endpoint
- No error handling - exposes internal errors and stack traces

### Secure API Route Example

```tsx title="apps/web/src/app/api/transactions/route.ts" {7-15,17-20,22-27,29-34}
import { z } from 'zod'
import { verifyAuth } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

// 1. Input validation schema
const TransactionSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive().max(10000)
})

export async function POST(request: Request) {
  try {
    // 2. Authentication check
    const user = await verifyAuth(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Input validation
    const body = await request.json()
    const { userId, amount } = TransactionSchema.parse(body)

    // 4. Authorization check
    if (user.id !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 5. Rate limiting
    const rateLimited = await checkRateLimit(user.id)
    if (rateLimited) {
      return Response.json({ error: 'Too many requests' }, { status: 429 })
    }

    // 6. Safe operation
    await db.transactions.create({
      userId,
      amount,
      timestamp: Date.now()
    })

    return Response.json({ success: true })
  } catch (error) {
    // 7. Safe error handling
    console.error('Transaction error:', error)
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}
```

## Environment Variable Security

\*\*Note: NEXT\_PUBLIC\_ Exposes Everything\*\*

Any environment variable prefixed with `NEXT_PUBLIC_` is bundled into the client JavaScript and visible to everyone. Never use it for secrets.

### Dangerous Configuration

```bash title=".env"
# ❌ DANGEROUS: Secret exposed to client
DATABASE_URL="postgres://user:pass@localhost:5432/db"
NEXT_PUBLIC_SECRET_API_KEY="sk_live_abc123"
JWT_SECRET="simple123"
```

**Why this is dangerous:**

- `NEXT_PUBLIC_SECRET_API_KEY` is visible in browser DevTools
- Anyone can extract and abuse your API key
- `JWT_SECRET` is too short and predictable

### Secure Configuration

```bash title=".env"
# ✅ SECURE: Secrets server-only
DATABASE_URL="postgres://user:pass@localhost:5432/db"
SECRET_API_KEY="sk_live_abc123"
JWT_SECRET="complex-random-32-char-minimum-string-here"

# Only expose non-sensitive data to client
NEXT_PUBLIC_API_URL="https://api.example.com"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xyz789"
```

**Safe to expose with NEXT\_PUBLIC\_:**

- ✅ API URLs and endpoints
- ✅ Feature flags and configuration
- ✅ Analytics IDs (Google Analytics, Segment)
- ✅ Publishable keys (Stripe, Google Maps)

**Never expose with NEXT\_PUBLIC\_:**

- ❌ Secret API keys
- ❌ Database URLs or credentials
- ❌ JWT secrets
- ❌ Private tokens or passwords

## Hands-On Exercise 4.1

The starter repo has an insecure API route. Add security layers to harden it against common vulnerabilities.

**Target file:** `apps/web/src/app/api/transactions/route.ts`

**Requirements:**

1. Add Zod schema validation for all inputs
2. Add try/catch with safe error handling (no stack traces)
3. Implement basic rate limiting (track by IP or user ID)
4. Return generic error messages to clients
5. Log detailed errors server-side only

**Implementation hints:**

- Use `zod.safeParse()` to catch validation errors gracefully
- Return generic error messages like "Invalid input" instead of detailed validation errors
- Add correlation IDs (unique identifiers to trace requests across logs) for debugging: `console.error('[req-123] Transaction failed:', error)`
- Consider using `server-only` package to enforce server-side imports
- Test error paths: send invalid JSON, missing auth, wrong user ID

**Example validation flow:**

```tsx
const result = TransactionSchema.safeParse(body)
if (!result.success) {
  console.error('[req-123] Validation failed:', result.error)
  return Response.json({ error: 'Invalid input' }, { status: 400 })
}
```

\*\*Note: Need Help Implementing Rate Limiting?\*\*

Unsure how to build production-ready rate limiting for your API routes? Use this structured prompt to generate a robust solution:

```markdown title="Prompt: Generate Rate Limiting Implementation"
<context>
I need to implement rate limiting for Next.js API routes and Server Actions to prevent abuse and DDoS attacks.

My application setup:
- Next.js with App Router
- API routes in apps/web/src/app/api/**/*.ts
- Server Actions in apps/web/src/app/actions/**/*.ts
- Currently NO rate limiting implemented
- Need to support both authenticated and anonymous users
</context>

<current-implementation>
I have no rate limiting. All routes are vulnerable to spam and abuse. Users can make unlimited requests to any endpoint.
</current-implementation>

<requirements>
1. **Tracking mechanism:** Rate limit by:
   - User ID for authenticated requests
   - IP address for anonymous requests
   - Different limits per endpoint (e.g., login = 5/min, API = 100/min)

2. **Storage:** Where to store rate limit counters?
   - In-memory Map (simple, single-server only)
   - Redis (production, multi-server support)
   - Vercel KV (serverless-compatible)

3. **Response handling:** When limit exceeded:
   - Return 429 Too Many Requests
   - Include Retry-After header
   - Log abuse attempts for monitoring

4. **Configurability:** Need flexible limits like:
   - 5 requests per minute for auth endpoints
   - 100 requests per minute for general API
   - 1000 requests per hour for analytics

5. **Performance:** Must NOT slow down every request:
   - Async increment (don't block response)
   - Minimal latency overhead (<5ms)
   - Efficient memory usage
</requirements>

<questions>
1. **Implementation pattern:** Should I create:
   - A middleware function that wraps route handlers?
   - A utility function called inside each handler?
   - A higher-order function that decorates handlers?

2. **Redis vs in-memory:** For production Next.js on Vercel:
   - Is in-memory Map safe for single-region deployments?
   - Should I use Vercel KV (Redis-compatible) for multi-region?
   - How do I handle counter resets between deployments?

3. **Sliding window vs fixed window:**
   - Fixed window: Simple but allows bursts at boundaries
   - Sliding window: More accurate but more complex
   - Which approach balances simplicity and protection?

4. **Bypass for internal requests:** Should I:
   - Whitelist certain IP addresses (internal tools)?
   - Skip rate limiting for requests with admin auth tokens?
   - Apply different limits based on user subscription tier?

5. **Edge cases:** How do I handle:
   - Clock skew across servers?
   - Distributed counter consistency?
   - Rate limit resets during server restarts?
</questions>

<specific-scenario>
Example route that needs rate limiting:

    export async function POST(request: Request) {
      // TODO: Rate limit to 5 attempts per minute per IP
      const { email, password } = await request.json()
      const user = await verifyCredentials(email, password)
      return Response.json({ token: generateToken(user) })
    }

Expected implementation:
- Track failed login attempts by IP address
- Limit: 5 requests per minute
- Response when exceeded:
    { "error": "Too many requests", "retryAfter": 45 }
  Status: 429
  Header: Retry-After: 45

Also need rate limiting for:
- General API routes: 100 requests/min per user
- Server Actions: 50 requests/min per user
- Public endpoints: 20 requests/min per IP
</specific-scenario>

Generate a production-ready rate limiting implementation with code examples for Next.js API routes, including Redis-backed storage, sliding window algorithm, and graceful error handling. Provide both the rate limiting utility and example usage in route handlers.
```

This prompt will help you build a robust rate limiting system that prevents abuse without degrading performance for legitimate users.

## Try It

1. **Test invalid input:**
   ```bash
   curl -X POST http://localhost:3000/api/transactions \
     -H "Content-Type: application/json" \
     -d '{"userId": "invalid", "amount": -100}'
   ```
   Expected: `400 Bad Request` with `{ "error": "Invalid input" }`

2. **Test missing authentication:**
   ```bash
   curl -X POST http://localhost:3000/api/transactions \
     -H "Content-Type: application/json" \
     -d '{"userId": "user-123", "amount": 100}'
   ```
   Expected: `401 Unauthorized` with `{ "error": "Unauthorized" }`

3. **Verify environment variables:**
   - Check browser DevTools → Sources → search for `.env` variables
   - Confirm no secrets appear in client bundle

## Commit & Deploy

```bash
git add -A
git commit -m "feat(polish): harden API with validation, auth, and secure env config"
git push -u origin feat/polish-security
```

## Done-When

- [ ] `curl -X POST localhost:3000/api/transactions -d '{"amount": "bad"}'` returns 400 "Invalid input"
- [ ] `curl -X POST localhost:3000/api/transactions -d '{"userId": "abc", "amount": -5}'` returns 400
- [ ] 10+ rapid requests return 429 "Too many requests"
- [ ] Error responses contain only "Invalid input", "Too many requests", or "Server error" (no stack traces)
- [ ] No secrets in browser DevTools Sources tab

\*\*Side Quest: Security Audit Checklist\*\*

## Solution

Complete secured API route

```tsx title="apps/web/src/app/api/transactions/route.ts"
import { z } from "zod";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// 1. Input validation schema
const TransactionSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().positive().max(10000),
});

// Simple in-memory rate limiter (use Redis in production)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = requestCounts.get(identifier);

  if (!limit || now > limit.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + 60000 });
    return false;
  }

  if (limit.count >= 10) {
    return true; // Rate limited
  }

  limit.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // 2. Rate limiting (by IP for demo)
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    // 3. Input validation
    const body = await request.json();
    const result = TransactionSchema.safeParse(body);

    if (!result.success) {
      console.error("[transaction] Validation failed:", result.error);
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { userId, amount } = result.data;

    // 4. Process transaction (mock)
    const transaction = {
      id: crypto.randomUUID(),
      userId,
      amount,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      timestamp: transaction.timestamp,
    });
  } catch (error) {
    // 5. Safe error handling
    console.error("[transaction] Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({
    transactions: [
      { id: "1", amount: 100, status: "completed" },
      { id: "2", amount: 250, status: "pending" },
    ],
  });
}
```

**Key security layers implemented:**

1. **Input Validation**: Zod schema validates `userId` as UUID and `amount` as positive number ≤10000
2. **Rate Limiting**: Simple in-memory rate limiter (10 requests/minute per IP)
3. **Error Handling**: Logs detailed errors server-side, returns generic messages to clients
4. **Safe Parsing**: Uses `safeParse()` to gracefully handle malformed input

**To add authentication**, create a helper in `src/lib/auth.ts`:

```tsx title="apps/web/src/lib/auth.ts"
import type { NextRequest } from "next/server";

export async function verifyAuth(request: NextRequest) {
  // Check for auth header or cookie
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  // In production: verify JWT, check session, etc.
  // For demo: return mock user
  return { id: "user-123", role: "user" };
}
```

**5-Layer Security Checklist:**

1. **Authentication**: Verify user identity with `verifyAuth()`
2. **Input Validation**: Use Zod to validate all request data
3. **Authorization**: Check `user.id === requestedUserId`
4. **Rate Limiting**: Track requests per user/IP and enforce limits
5. **Error Handling**: Log detailed errors server-side, return generic messages

**Minimum hardening prevents the most common vulnerabilities that lead to production breaches.**

## Troubleshooting

\*\*Warning: Rate Limit Errors During Testing\*\*

If you're seeing rate limit errors during testing, restart your dev server. The in-memory rate limiter state persists across requests until the server restarts.

**Why this happens:** The `requestCounts` Map lives in Node.js memory. Each request increments the counter, but the counter only resets when the 60-second window expires OR when the server restarts.

**Quick fix:** Stop the dev server (`Ctrl+C`) and restart it (`pnpm dev`).

**Development tip:** For easier testing, you can add a reset mechanism:

```tsx title="apps/web/src/app/api/transactions/route.ts"
// Add to your rate limiter for development only
export function GET() {
  if (process.env.NODE_ENV === 'development') {
    requestCounts.clear()
    return NextResponse.json({ message: 'Rate limits reset' })
  }
  // ... existing GET handler
}
```

In production, use Redis or Vercel KV instead of in-memory storage. This avoids state persistence issues and works across multiple server instances.

## References

- <https://nextjs.org/docs/app/building-your-application/configuring/environment-variables>
- <https://nextjs.org/docs/app/building-your-application/routing/route-handlers>
- <https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations>
- <https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy>
- <https://nextjs.org/docs/app/guides/data-security>
- <https://zod.dev/> - Zod validation library
- <https://nextjs.org/blog/security-nextjs-server-components-actions> - Security best practices


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
