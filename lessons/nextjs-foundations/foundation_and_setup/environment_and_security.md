---
title: "Environment and Security"
description: "Learn how to protect sensitive data from client exposure using the server-only package, understand environment variable precedence, and implement security patterns that catch mistakes at build time."
canonical_url: "https://vercel.com/academy/nextjs-foundations/env-and-security"
md_url: "https://vercel.com/academy/nextjs-foundations/env-and-security.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-09T23:37:41.748Z"
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

# Environment and Security

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Environment and Security

Your API key just showed up in a GitHub security alert. Someone scraped your client-side JavaScript bundle and found `DATABASE_URL` hardcoded in the code. This happens when developers accidentally expose server secrets to the browser. Next.js provides multiple layers of protection against this, but you need to know how to use them.

## Outcome

Create a Data Access Layer (a centralized module that handles all database queries and data retrieval) protected by `server-only` that causes build failures when accidentally imported into Client Components.

## Fast Track

1. Install `server-only` package and create `lib/server/db.ts` with the import
2. Try importing it in a Client Component and observe the build error
3. Create proper Data Transfer Objects (DTOs) that safely pass data to clients

## Environment Variable Precedence

Next.js loads environment variables from multiple files in a [specific order](https://nextjs.org/docs/app/guides/environment-variables#environment-variable-load-order):

```
1. process.env (runtime environment)
2. .env.$(NODE_ENV).local  (.env.development.local, .env.production.local) — NODE_ENV is the standard environment variable indicating whether you're in development, production, or test mode
3. .env.local              (not loaded in test environment)
4. .env.$(NODE_ENV)        (.env.development, .env.production)
5. .env                    (base defaults)
```

The first match wins. This means `.env.development.local` overrides `.env.local`, which overrides `.env.development`, which overrides `.env`.

\*\*Note: Where to Put .env Files\*\*

If you use a `/src` directory, `.env.*` files still go in the project root, not inside `/src`.

## The NEXT\_PUBLIC\_ Boundary

Variables prefixed with `NEXT_PUBLIC_` are [inlined into the JavaScript bundle at build time](https://nextjs.org/docs/app/guides/environment-variables#bundling-environment-variables-for-the-browser):

```bash title=".env.local"
# Safe: Only accessible server-side
DATABASE_URL="postgresql://user:password@localhost/db"

# EXPOSED: Embedded in client JavaScript bundle
NEXT_PUBLIC_ANALYTICS_ID="G-ABC123"
```

After build, `NEXT_PUBLIC_ANALYTICS_ID` becomes a hardcoded string in your JavaScript. Anyone can read it via browser DevTools.

\*\*Warning: Build-Time Substitution\*\*

`NEXT_PUBLIC_*` variables are replaced at build time with static values. Changing them requires a rebuild. Dynamic lookups like `process.env[varName]` will not be inlined.

## Self-Paced Exercise

**Requirements:**

1. Install the `server-only` package
2. Create a Data Access Layer in `lib/server/` with `server-only` protection
3. Create a function that returns safe, minimal data (a DTO)
4. Demonstrate the build error when `server-only` code is imported into a Client Component
5. Show the correct pattern: Server Component calls DAL, passes DTO to Client Component

**Implementation hints:**

- The `server-only` package causes a [build-time error](https://nextjs.org/docs/app/guides/data-security#preventing-client-side-execution-of-server-only-code) if imported in client code
- A Data Access Layer centralizes data fetching and authorization in one place
- Data Transfer Objects (DTOs) contain only the fields needed for rendering
- Server Components can safely call the DAL and pass sanitized data to Client Components

## Try It

### Step 1: Install server-only

```bash
pnpm add server-only --filter @repo/web
```

### Step 2: Create a protected Data Access Layer

```typescript title="apps/web/src/lib/server/db.ts" {1}
import "server-only";

// Simulate a database call that uses server secrets
export function getUserFromDB(userId: string) {
  // In real code, this would use process.env.DATABASE_URL
  // The INTERNAL_CONFIG demonstrates server-only variable access
  const config = process.env.INTERNAL_CONFIG ?? "default";

  // Simulated database response with sensitive fields
  return {
    id: userId,
    email: "user@example.com",
    passwordHash: "bcrypt$2b$10$...", // NEVER expose this
    internalNotes: `VIP customer (config: ${config})`, // NEVER expose this
    name: "Jane Developer",
    createdAt: new Date().toISOString(),
  };
}
```

### Step 3: Create a safe DTO function

```typescript title="apps/web/src/lib/server/user-dto.ts" {1}
import "server-only";
import { getUserFromDB } from "./db";

// Return only safe, public fields
export function getUserDTO(userId: string) {
  const user = getUserFromDB(userId);

  // Only return fields that are safe to expose
  return {
    id: user.id,
    name: user.name,
    createdAt: user.createdAt,
  };
}
```

### Step 4: Use the DTO in a Server Component

```tsx title="apps/web/src/app/security-demo/page.tsx"
import { getUserDTO } from "@/lib/server/user-dto";
import { UserCard } from "@/components/user-card";

export default function SecurityDemoPage() {
  // Server Component safely calls the Data Access Layer
  const user = getUserDTO("user-123");

  return (
    <main className="flex flex-col gap-4 p-4">
      <h1 className="font-bold text-2xl">Security Demo</h1>
      <p className="text-gray-600">
        This page demonstrates secure data fetching patterns.
      </p>
      {/* Pass only the safe DTO to the Client Component */}
      <UserCard user={user} />
    </main>
  );
}
```

### Step 5: Create a Client Component that receives safe data

```tsx title="apps/web/src/components/user-card.tsx"
"use client";

type UserDTO = {
  id: string;
  name: string;
  createdAt: string;
};

export function UserCard({ user }: { user: UserDTO }) {
  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      <h2 className="font-semibold">{user.name}</h2>
      <p className="text-gray-500 text-sm">ID: {user.id}</p>
      <p className="text-gray-500 text-sm">
        Joined: {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
```

### Step 6: Verify the server-only protection

Create a test component that incorrectly imports server code:

```tsx title="apps/web/src/components/bad-import.tsx"
"use client";

// This will cause a BUILD ERROR when used
import { getUserFromDB } from "@/lib/server/db";

export function BadImport() {
  const _user = getUserFromDB("test");
  return <div>This should never render</div>;
}
```

Create a page that uses this component (unused files are tree-shaken):

```tsx title="apps/web/src/app/test-bad-import/page.tsx"
import { BadImport } from "@/components/bad-import";

export default function TestBadImportPage() {
  return <BadImport />;
}
```

Run the build:

```bash
pnpm build --filter @repo/web
```

**Expected error output:**

```
Error: Turbopack build failed with 2 errors:
./apps/web/src/lib/server/db.ts:1:1
Ecmascript file had an error
> 1 | import "server-only";
    | ^^^^^^^^^^^^^^^^^^^^

'server-only' cannot be imported from a Client Component module.
It should only be used from a Server Component.
```

\*\*Note: The Protection Works\*\*

The `server-only` package catches the mistake at build time, not in production. Delete both test files after verifying the error.

### Step 7: Clean up and verify the page works

```bash
rm apps/web/src/components/bad-import.tsx
rm -r apps/web/src/app/test-bad-import
pnpm dev --filter @repo/web
```

Visit `http://localhost:3000/security-demo` and verify the UserCard displays safe data.

## Environment File Documentation

Your `.env.local` was created in [Project Setup](/01-foundation-and-setup/project-setup) via `vercel link`. For team documentation, create a `.env.example` that shows required variables without real values:

```bash title="apps/web/.env.example"
# Client-accessible (bundled in JavaScript at build time)
# Only use for truly public data like analytics IDs
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Server-only (undefined in Client Components)
# Safe for secrets - never prefix these with NEXT_PUBLIC_
INTERNAL_CONFIG="your-server-config"
DATABASE_URL="postgresql://user:password@localhost/db"
```

\*\*Note: Best Practice\*\*

Commit `.env.example` to version control. It documents required variables without exposing real values. New team members can copy it to `.env.local` and fill in their own values, or use `vercel env pull` to get values from the project.

## Commit

```bash
git add -A
git commit -m "feat(foundation): add server-only Data Access Layer for security"
```

## Done-When

- [ ] `server-only` package is installed (`pnpm list server-only --filter @repo/web` shows it)
- [ ] `lib/server/db.ts` exists with `import "server-only"` at the top
- [ ] Build fails when a page imports a Client Component that uses `lib/server/db.ts`
- [ ] `/security-demo` page displays user data through the safe DTO pattern
- [ ] `.env.example` documents both public and server-only variables

## Troubleshooting

Module not found: server-only

```bash
Module not found: Can't resolve 'server-only'
```

**Fix:** Install the package in the correct workspace:

```bash
pnpm add server-only --filter @repo/web
```

Build error persists after removing bad import

**Fix:** Clear the Next.js cache:

```bash
rm -rf apps/web/.next
pnpm build --filter @repo/web
```

\*\*Note: Still Stuck?\*\*

Ask your coding agent for help. Paste the error message and it can diagnose the issue.

````markdown title="Prompt: Debug Undefined Environment Variable"
My environment variable is `undefined` in Next.js 16.

**Variable name:** `_____`
Example: `DATABASE_URL` or `NEXT_PUBLIC_API_URL`

**Where I'm accessing it:**
- [ ] Server Component
- [ ] Client Component
- [ ] API Route / Route Handler
- [ ] Server Action
- [ ] next.config.js

**My .env file location:** _____
Example: `apps/web/.env.local` or `.env.local` at root

**My .env file contents (redact sensitive values):**
```
___PASTE_RELEVANT_ENV_LINES___
```

Example:
```
DATABASE_URL=postgres://...
NEXT_PUBLIC_API_URL=https://api.example.com
```

**How I'm accessing it:**
```tsx
___PASTE_CODE_ACCESSING_ENV_VAR___
```

Example:
```tsx
const url = process.env.DATABASE_URL
// or
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

**Questions:**
1. Does my variable need the `NEXT_PUBLIC_` prefix?
2. Is my .env file in the right location for my monorepo?
3. Did I restart the dev server after adding the variable?

Why is my environment variable undefined and how do I fix it?
````

## Solution

Complete Implementation

### lib/server/db.ts

```typescript title="apps/web/src/lib/server/db.ts"
import "server-only";

export function getUserFromDB(userId: string) {
  const config = process.env.INTERNAL_CONFIG ?? "default";

  return {
    id: userId,
    email: "user@example.com",
    passwordHash: "bcrypt$2b$10$...",
    internalNotes: `VIP customer (config: ${config})`,
    name: "Jane Developer",
    createdAt: new Date().toISOString(),
  };
}
```

### lib/server/user-dto.ts

```typescript title="apps/web/src/lib/server/user-dto.ts"
import "server-only";
import { getUserFromDB } from "./db";

export function getUserDTO(userId: string) {
  const user = getUserFromDB(userId);

  return {
    id: user.id,
    name: user.name,
    createdAt: user.createdAt,
  };
}
```

### app/security-demo/page.tsx

```tsx title="apps/web/src/app/security-demo/page.tsx"
import { getUserDTO } from "@/lib/server/user-dto";
import { UserCard } from "@/components/user-card";

export default function SecurityDemoPage() {
  const user = getUserDTO("user-123");

  return (
    <main className="flex flex-col gap-4 p-4">
      <h1 className="font-bold text-2xl">Security Demo</h1>
      <p className="text-gray-600">
        This page demonstrates secure data fetching patterns.
      </p>
      <UserCard user={user} />
    </main>
  );
}
```

### components/user-card.tsx

```tsx title="apps/web/src/components/user-card.tsx"
"use client";

type UserDTO = {
  id: string;
  name: string;
  createdAt: string;
};

export function UserCard({ user }: { user: UserDTO }) {
  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      <h2 className="font-semibold">{user.name}</h2>
      <p className="text-gray-500 text-sm">ID: {user.id}</p>
      <p className="text-gray-500 text-sm">
        Joined: {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
```

\*\*Side Quest: Add Runtime Env Validation with Zod\*\*

## Advanced: Defense in Depth

### Layer 1: Build-Time Protection (server-only)

The `server-only` package is your first line of defense. It catches mistakes during development before they reach production.

### Layer 2: Data Minimization (DTOs)

Never pass entire database objects to Client Components. Create explicit DTO functions that return only what the UI needs. This follows the principle of [API minimization](https://www.w3.org/2001/tag/doc/APIMinimization) (only exposing the minimum data necessary for a given purpose).

### Layer 3: Environment Variable Hygiene

- **NEVER** prefix secrets with `NEXT_PUBLIC_`
- Use `.env.local` for local secrets (gitignored by default)
- Use `.env.example` to document required variables (committed)
- Consider using a secrets manager (services that securely store and manage sensitive credentials) for production (Vercel, AWS Secrets Manager, etc.)

### Layer 4: Data Tainting (Experimental)

React provides experimental APIs to "taint" objects and values, preventing them from being passed to the client:

```typescript
import { experimental_taintObjectReference } from "react";

const user = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
experimental_taintObjectReference("Do not pass user to client", user);
```

To enable tainting in Next.js:

```javascript title="next.config.js"
module.exports = {
  experimental: {
    taint: true,
  },
};
```

\*\*Warning: Experimental Feature\*\*

Tainting is experimental and subject to change. Use `server-only` as your primary protection mechanism.

## References

- [Environment Variables](https://nextjs.org/docs/app/guides/environment-variables) - Loading and bundling env vars
- [Data Security](https://nextjs.org/docs/app/guides/data-security) - Protecting sensitive data in Server Components
- [server-only package](https://www.npmjs.com/package/server-only) - Build-time protection for server code


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
