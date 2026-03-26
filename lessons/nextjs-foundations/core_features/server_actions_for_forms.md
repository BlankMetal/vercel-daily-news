---
title: "Server Actions for Forms"
description: "Use Server Actions for secure mutations with type safety and built-in progressive enhancement."
canonical_url: "https://vercel.com/academy/nextjs-foundations/server-actions-for-forms"
md_url: "https://vercel.com/academy/nextjs-foundations/server-actions-for-forms.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-14T13:55:43.911Z"
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

# Server Actions for Forms

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Server Actions for Forms

Your contact form works great—until you check the network tab and see your API key in the request payload. Or a user on a slow connection submits before JavaScript loads and nothing happens.

Server Actions fix both: mutations run on the server (no exposed secrets), and forms work with or without JavaScript. Type-safe, progressively enhanced form handling.

## Outcome

A working form that posts via Server Action with validation and error surfaces.

## Prerequisites

This lesson uses [Zod](https://zod.dev/) for runtime validation. Zod is a TypeScript-first schema validation library that parses data and returns type-safe results.

Install it in the web app before starting:

```bash title="From project root"
pnpm add zod --filter @repo/web
```

Or navigate to the app directory first:

```bash
cd apps/web
pnpm add zod
```

## Fast Track

1. Create a Server Action with input validation (zod).
2. Add a form that posts to it.
3. Handle success and error states.

\*\*Note: Building a New Server Action?\*\*

Planning a secure form with validation? Use this prompt to design your Server Action:

```markdown title="Prompt: Design Server Action with Validation"
<context>
I'm building a Next.js application using Server Actions for form handling.
I want to create a type-safe Server Action with proper validation, error handling, and progressive enhancement.
</context>

<specific-scenario>
Form purpose: [What does this form do? e.g., user registration, blog post creation, settings update]

Input fields:
1. [Field name and type - e.g., email (string, email format)]
2. [Field name and type - e.g., password (string, min 8 chars)]
3. [Field name and type - e.g., age (number, optional)]

Business logic:
- [What happens after validation? Database insert, API call, file upload?]
- [Any side effects? Send email, update cache, trigger webhook?]

Error scenarios:
- [What validation errors are possible?]
- [What runtime errors could occur? Database connection, API failure?]
</specific-scenario>

<questions>
1. **Zod schema:** How do I structure the Zod schema for my inputs with proper validation rules?
2. **Server Action signature:** Should I use FormData or parsed object as input?
3. **Error handling:** How do I return typed error responses that the client can display?
4. **Success response:** What should the success payload include? Redirect URL, updated data?
5. **Progressive enhancement:** How do I ensure the form works without JavaScript?
6. **useActionState:** How do I integrate with useActionState for client-side state management?
7. **useFormStatus:** How do I add loading states to the submit button?
8. **Security:** What security considerations do I need (rate limiting, CSRF protection)?
9. **Database operations:** Should I use transactions for multiple operations?
10. **Revalidation:** Should I call revalidatePath() or revalidateTag() after mutations?
</questions>

<current-attempt>
[If you have a draft, paste it here]
</current-attempt>

Provide a complete Server Action implementation with Zod validation, typed error handling, progressive enhancement support, and client-side integration using useActionState and useFormStatus. Explain security best practices and when to use revalidation.
```

This will give you production-ready Server Action code with proper validation and error handling.

## Hands-On Exercise 2.8

Build secure form handling with Server Actions and progressive enhancement.

**Requirements:**

1. Validate inputs server-side with Zod schema.
2. Return typed success/error payloads.
3. Render errors inline without leaking stack traces.
4. Add loading states with `useFormStatus`.

**Implementation hints:**

- **Progressive enhancement:** Forms work without JavaScript enabled; HTML form submission fallback.
- **useActionState:** Manages form submission state and server responses in Client Components (replaces deprecated useFormState in React 19).
- **useFormStatus:** Provides loading state for submit buttons (pending state).
- **Zod validation:** Use schema validation for type-safe input checking on the server.
- **Type safety:** Full TypeScript support between client and server boundaries.
- **No API routes needed:** Server Actions handle mutations directly, no need for separate /api endpoints.
- Keep secrets server-side; never send API keys to the client.
- Add correlation logging where useful.
- Server Actions run on the server but can be called from Client Components.

\*\*Note: Progressive Enhancement\*\*

Server Actions provide excellent UX with progressive enhancement. Forms work with and without JavaScript, providing a baseline experience that enhances with interactivity.

\*\*Note: Type-Safe Mutations\*\*

Server Actions provide full TypeScript support between client and server. Use Zod for runtime validation and TypeScript interfaces for compile-time safety.

\*\*Note: Optional: Generate with v0\*\*

Use v0 to scaffold the form UI (labels, inputs, error slots, disabled states). Keep logic in Server Actions; do not generate fetch calls or client validation code.

Prompt:

```text
Create an accessible form with name and email fields inline error slots submit button and disabled loading state using Tailwind presentational only no data fetching or client validation.
```

Open in v0: [Open in v0](https://v0.app?q=Create%20an%20accessible%20form%20with%20name%20and%20email%20fields%20inline%20error%20slots%20submit%20button%20and%20disabled%20loading%20state%20using%20Tailwind%20presentational%20only%20no%20data%20fetching%20or%20client%20validation.)

## Try It

1. **Test valid submission:**

   ```bash
   # Submit form with valid data
   # Browser shows: "Message sent successfully!"
   ```

   Expected response:

   ```json
   { "success": true, "message": "Message sent successfully!" }
   ```

2. **Test validation errors:**

   ```bash
   # Submit form with invalid email
   # Browser shows: "Invalid email address"
   ```

   Expected response:

   ```json
   { "errors": { "email": ["Invalid email address"], "message": ["Message must be at least 10 characters"] } }
   ```

3. **Verify progressive enhancement:**
   - Disable JavaScript in DevTools (Settings → Debugger → Disable JavaScript)
   - Submit form - should still work (page refresh with result)
   - Re-enable JavaScript - form submits without page refresh

## Commit & Deploy

```bash
git add -A
git commit -m "feat(core): add Server Action form with validation"
git push -u origin feat/core-server-actions-form
```

## Done-When

- [ ] Navigate to `/contact`, fill form with valid data, submit: "Message sent successfully!" appears
- [ ] Submit with invalid email (e.g., "notanemail"): "Invalid email address" error appears inline
- [ ] Submit with short message (under 10 chars): "Message must be at least 10 characters" error appears
- [ ] During submission: button shows "Submitting..." and is disabled (loading state)
- [ ] Disable JavaScript in DevTools, submit form: still works (page refreshes with result)
- [ ] View page source: no API keys or secrets visible in HTML

\*\*Side Quest: Build Form State Recovery\*\*

## Solution

Solution

### Install Dependencies

Server Actions use Zod for runtime validation. Install it first:

```bash
pnpm add zod
```

### Server Action with Zod Validation

```typescript title="apps/web/src/app/actions/contact.ts"
'use server'

import { z } from 'zod'

// Define validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

// Type for form state
type FormState = {
  success?: boolean
  message?: string
  errors?: {
    name?: string[]
    email?: string[]
    message?: string[]
  }
}

export async function submitContactForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Extract form data
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  }

  // Validate with Zod
  const validatedFields = contactSchema.safeParse(rawData)

  // Return validation errors if any
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Simulate API call or database operation
  try {
    // In production: await db.contacts.create(validatedFields.data)
    // In production: await sendEmail(validatedFields.data)

    // biome-ignore lint/suspicious/noConsole: Demo logging for development
    console.log('Contact form submitted:', validatedFields.data)

    return {
      success: true,
      message: 'Message sent successfully!',
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Error logging for debugging
    console.error('Contact form error:', error)
    return {
      message: 'Failed to send message. Please try again.',
    }
  }
}
```

### Form Component with useActionState

```typescript title="apps/web/src/app/contact/page.tsx"
'use client'

import { useActionState } from 'react'
import { submitContactForm } from '@/app/actions/contact'
import { SubmitButton } from '@/app/ui/submit-button'

const initialState = {
  message: '',
}

export default function ContactPage() {
  const [state, formAction, pending] = useActionState(
    submitContactForm,
    initialState
  )

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Contact Us</h1>

      <form action={formAction} className="space-y-4">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full rounded-md border px-3 py-2"
          />
          {state?.errors?.name && (
            <p className="mt-1 text-sm text-red-600" aria-live="polite">
              {state.errors.name[0]}
            </p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full rounded-md border px-3 py-2"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-sm text-red-600" aria-live="polite">
              {state.errors.email[0]}
            </p>
          )}
        </div>

        {/* Message field */}
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            className="w-full rounded-md border px-3 py-2"
          />
          {state?.errors?.message && (
            <p className="mt-1 text-sm text-red-600" aria-live="polite">
              {state.errors.message[0]}
            </p>
          )}
        </div>

        {/* Success message */}
        {state?.success && (
          <p className="font-medium text-green-600" aria-live="polite">
            {state.message}
          </p>
        )}

        {/* Generic error message */}
        {state?.message && !state?.success && (
          <p className="text-red-600" aria-live="polite">
            {state.message}
          </p>
        )}

        {/* Submit button with loading state */}
        <SubmitButton />
      </form>
    </div>
  )
}
```

### Submit Button with useFormStatus

```typescript title="apps/web/src/app/ui/submit-button.tsx"
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {pending ? 'Submitting...' : 'Send Message'}
    </button>
  )
}
```

\*\*Note: Why Separate Submit Button?\*\*

`useFormStatus` only works in components that are children of a `<form>`. That's why we extract the submit button into its own component. This pattern keeps loading state isolated and reusable.

\*\*Note: Progressive Enhancement\*\*

This form works with JavaScript disabled. When JS is off, the form submits like a traditional HTML form with a full page refresh. When JS is enabled, it submits via Server Action without a page refresh, showing loading states and inline errors.

\*\*Warning: Security Best Practices\*\*

- ✅ Validation happens on the server (client-side validation is optional UX enhancement)
- ✅ Secrets and API keys stay on the server (never in Client Components)
- ✅ Generic error messages prevent information leakage
- ✅ No stack traces exposed to the client
- ✅ Use `safeParse` to handle validation errors gracefully

### Key Patterns

1. **Server Action signature with useActionState:**
   ```typescript
   async function action(prevState: State, formData: FormData): Promise<State>
   ```
   - First param: previous state from `useActionState`
   - Second param: FormData from the form submission
   - Return: new state object

2. **Error handling approach:**
   - Return errors as state (don't throw)
   - Use `safeParse` for validation
   - Flatten Zod errors: `error.flatten().fieldErrors`

3. **Progressive enhancement:**
   - Forms work without JavaScript
   - `useActionState` enhances with inline errors and no page refresh
   - `useFormStatus` adds loading states when JS is available

### Invalidating Cache After Mutations

When a Server Action mutates data, invalidate related cache entries so users see fresh content:

```typescript title="apps/web/src/app/actions/products.ts"
'use server'

import { revalidateTag } from 'next/cache'

export async function updateProduct(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const price = formData.get('price') as string

  // 1. Mutate data
  await db.products.update({
    where: { id },
    data: { name, price: parseFloat(price) }
  })

  // 2. Invalidate cache (Next.js 16.1.x requires second argument)
  revalidateTag(`product-${id}`, 'max')  // Specific product
  revalidateTag('products', 'max')        // Product list

  return { success: true }
}
```

**The pattern:**

1. **Mutate:** Update database/API
2. **Invalidate:** Call `revalidateTag()` for affected cache entries
3. **Revalidate:** Next request gets fresh data

\*\*Warning: revalidateTag() Requires Two Arguments\*\*

In Next.js 16.1.x, `revalidateTag()` requires a second argument:

```typescript
// ❌ Old API (breaks in 16.1.x)
revalidateTag('products')

// ✅ New API
revalidateTag('products', 'max')           // Stale-while-revalidate
revalidateTag('products', { expire: 0 })   // Immediate expiration
```

\*\*Note: Learn More About Caching\*\*

You'll learn to add `cacheTag()` to your data functions in [Lesson 3.1: Cache Components](/03-advanced-patterns/cache-components). That lesson covers the full caching mental model: `"use cache"`, `cacheLife()`, `cacheTag()`, and `revalidateTag()`.

## References

- <https://nextjs.org/docs/app/getting-started/updating-data>
- <https://nextjs.org/docs/app/guides/forms>
- <https://zod.dev/> - Zod documentation
- <https://react.dev/reference/react/useActionState> - React useActionState hook
- <https://react.dev/reference/react-dom/hooks/useFormStatus> - React useFormStatus hook


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
