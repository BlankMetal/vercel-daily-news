---
title: "Component Composition Patterns"
description: "Implement a small compound component (e.g., Dialog.*) pattern that composes cleanly with server/client boundaries."
canonical_url: "https://vercel.com/academy/nextjs-foundations/component-composition-patterns"
md_url: "https://vercel.com/academy/nextjs-foundations/component-composition-patterns.md"
docset_id: "vercel-academy"
doc_version: "1.0"
last_updated: "2026-03-09T23:39:25.178Z"
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

# Component Composition Patterns

\*\*Note: This Course Is in Beta\*\*

You're getting early access to this course as it's being refined. Have feedback? Please share it in the widget at the bottom of each lesson.

# Component Composition Patterns

Your Dialog component has 14 props: `showTitle`, `titleText`, `showDescription`, `descriptionText`, `showCloseButton`, `closeButtonPosition`... and someone just asked for a custom footer. You could add three more props, or you could learn the pattern that makes this problem disappear.

Composition scales better than prop soup. Compound patterns reduce coupling and improve reuse.

**Why compound components?**

- **Flexibility:** Rearrange, add, or remove subcomponents without changing the component API
- **Readability:** Declarative structure mirrors the visual hierarchy (no prop soup)
- **TypeScript simplicity:** Each subcomponent has its own focused props interface
- **Server Component children:** Pass server-rendered content through client wrappers without serialization limits
- **Customization:** Replace individual subcomponents without forking the entire component

## Outcome

A reusable compound component using `@repo/ui` primitives.

## Fast Track

1. Define `Dialog.Root`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description`.
2. Keep state in a tiny client wrapper; content can be server-rendered.
3. Ensure accessibility basics (focus, escape close).

\*\*Note: Working Directory\*\*

This lesson uses **both apps** to demonstrate that shared UI components work across the monorepo. The primary implementation happens in `apps/web` (more complex demo), then we verify cross-app reusability in `apps/blog` (simpler use case).

## Hands-On Exercise 2.2

Build a compound component pattern for flexible, reusable UI.

**Requirements:**

1. Implement the compound API shape (Dialog.Trigger, Dialog.Content, Dialog.Title, Dialog.Description).
2. Use it in both apps to gate an action.
3. Verify accessibility (a11y) affordances (focus trap, escape close).
4. Demonstrate composability with server-rendered content.

**Implementation hints:**

- **Compound component pattern:** Like HTML elements (`<table>`, `<thead>`, `<tbody>`), use subcomponents instead of prop configuration.
- **Flexibility benefits:** Arrange subcomponents as needed, add/remove/rearrange parts easily, avoid prop soup like `showTitle`, `titleText`, `showDescription`, `descriptionText`.
- **State management:** Keep state in small client wrapper (`'use client'` on Dialog.Root), content can be server-rendered children.
- **Reusable patterns:** Create accessible UI patterns that work across the codebase.
- Lean on `@radix-ui/react-slot` patterns (Radix's Slot component lets you pass props to a child element, enabling polymorphic components).
- Keep public API stable; hide internals.

\*\*Note: Refactoring to Compound Components?\*\*

Have a component with too many props? Use this prompt to refactor it into a flexible compound pattern:

```markdown title="Prompt: Refactor Props to Compound Pattern"
<context>
I'm working on a Next.js application and have a component that accepts many configuration props.
I want to refactor it into a compound component pattern (like Dialog.Root, Dialog.Trigger, Dialog.Content) for better flexibility and composability.
</context>

<current-implementation>
[Paste your current component code with all its props]

Example of current usage:
[Show how the component is currently used]
</current-implementation>

<problems>
1. **Prop soup:** Too many props for configuration (showTitle, titleText, showFooter, footerContent, etc.)
2. **Inflexibility:** Hard to customize layout or add new sections without adding more props
3. **Complexity:** Component logic becomes complex handling all prop combinations
4. **Composition limits:** Can't easily compose with other components or pass Server Component children
</problems>

<questions>
1. **Subcomponent structure:** What subcomponents should I create (e.g., Root, Trigger, Content, Title, Description)?
2. **State sharing:** How do I share state between subcomponents (Context API, direct props)?
3. **Client boundaries:** Which subcomponents need 'use client' and which can remain Server Components?
4. **Public API:** What props should each subcomponent accept?
5. **Accessibility:** How do I maintain ARIA relationships between subcomponents?
6. **TypeScript:** How should I type the compound component pattern?
</questions>

<desired-api>
Ideal usage after refactoring:
[Show how you want the component to be used with compound pattern]

Example:
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Title here</Dialog.Title>
        <Dialog.Description>Description here</Dialog.Description>
        [Server-rendered content]
      </Dialog.Content>
    </Dialog.Root>
</desired-api>

Provide a refactored implementation with the compound component pattern, showing how to share state, maintain accessibility, and minimize client boundaries. Explain the design decisions for each subcomponent.
```

This will help you create flexible, reusable components that avoid prop soup and compose cleanly.

\*\*Note: Compound Component Advantage\*\*

The compound pattern provides flexible and reusable components that are easy to customize without brittle prop APIs.

\*\*Note: Optional: Generate with v0\*\*

Use v0 to scaffold a Dialog component shell, then refactor into a compound API. Keep it presentational (no data fetching); only mark the trigger wrapper with 'use client' if needed for state.

Prompt:

```text
Create an accessible modal dialog using Tailwind with title description and actions no data fetching presentational only focus trap included minimal client boundary.
```

Open in v0: [Open in v0](https://v0.app?q=Create%20an%20accessible%20modal%20dialog%20using%20Tailwind%20with%20title%20description%20and%20actions%20no%20data%20fetching%20presentational%20only%20focus%20trap%20included%20minimal%20client%20boundary.)

## Try It

- Trigger dialog; verify focus trap and close behavior.

## Commit & Deploy

```bash
git add -A
git commit -m "feat(core): add dialog compound component pattern"
git push -u origin feat/core-dialog-pattern
```

## Done-When

- [ ] Navigate to `/demo/dialog` in web app: click "Delete Account" button and dialog opens
- [ ] Navigate to `/demo/dialog` in blog app: click "Subscribe to Newsletter" button and dialog opens
- [ ] With dialog open, press Tab key repeatedly: focus cycles only through dialog elements, not page behind
- [ ] With dialog open, press Escape key: dialog closes
- [ ] With dialog open, click dark overlay outside dialog: dialog closes
- [ ] Open DevTools Accessibility panel with dialog open: verify `role="dialog"` and `aria-labelledby` attributes present (ARIA attributes help screen readers understand UI relationships)
- [ ] In web app `/demo/dialog`, click "View Terms": server-generated date appears in dialog content

## Solution

Solution

### Prerequisites

Install the Radix Dialog primitive in the `@repo/ui` package:

```bash
cd packages/ui
pnpm add @radix-ui/react-dialog
```

### Step 1: Create the Dialog Compound Component

Build the compound component in the shared UI package so both apps can use it.

```tsx title="packages/ui/src/components/dialog.tsx"
'use client'

import {
  Close,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
} from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@repo/ui/lib/utils'

// Re-export Root and Trigger directly (no customization needed)
const DialogRoot = Root
const DialogTrigger = Trigger
const DialogClose = Close

/**
 * Dialog.Overlay - Covers the screen behind the dialog
 */
function DialogOverlay({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Overlay>) {
  return (
    <Overlay
      className={cn(
        'data-[state=closed]:animate-out data-[state=open]:animate-in',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'fixed inset-0 z-50 bg-black/80',
        className
      )}
      {...props}
    />
  )
}

/**
 * Dialog.Content - The dialog panel itself
 * Children can be Server Components (passed through)
 */
function DialogContent({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Content>) {
  return (
    <Portal>
      <DialogOverlay />
      <Content
        className={cn(
          'data-[state=closed]:animate-out data-[state=open]:animate-in',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
          'gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200',
          className
        )}
        {...props}
      >
        {children}
        <Close
          className={cn(
            'absolute top-4 right-4 rounded-sm opacity-70',
            'ring-offset-background transition-opacity hover:opacity-100',
            'focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none',
            'disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
          )}
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </Close>
      </Content>
    </Portal>
  )
}

/**
 * Dialog.Header - Container for title and description
 */
function DialogHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

/**
 * Dialog.Footer - Container for action buttons
 */
function DialogFooter({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  )
}

/**
 * Dialog.Title - Accessible dialog title
 */
function DialogTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Title>) {
  return (
    <Title
      className={cn('font-semibold text-lg leading-none tracking-tight', className)}
      {...props}
    />
  )
}

/**
 * Dialog.Description - Accessible dialog description
 */
function DialogDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Description>) {
  return (
    <Description
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

// Export individual components (required for Server Component compatibility)
export {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
}
```

### Step 2: Export from the UI Package

Add the dialog export to the package.json exports:

```json title="packages/ui/package.json" {9}
{
  "name": "@repo/ui",
  "exports": {
    "./globals.css": "./src/styles/globals.css",
    "./lib/*": "./src/lib/*.ts",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts"
  }
}
```

\*\*Note: Export Pattern\*\*

The `"./components/*"` glob pattern already covers the new dialog.tsx file. No changes needed to package.json.

### Step 3: Use the Dialog in Web App

\*\*Note: Working Directory\*\*

This example uses `apps/web` to demonstrate multiple compound component patterns (confirmation dialog, server content in dialog, and accessibility features). The web app is appropriate here because it already has established demo routes and we want to show comprehensive usage before verifying cross-app compatibility.

Create a demo page that uses the compound component pattern.

```tsx title="apps/web/src/app/demo/dialog/page.tsx"
// Server Component - renders server content inside the dialog

import { Button } from '@repo/ui/components/button'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog'

// Simulated server data
async function getTermsContent(): Promise<string> {
  // This would fetch from a CMS or database in a real app
  return `By using this service, you agree to our terms. These terms were
  last updated on ${new Date().toLocaleDateString()}. Server-rendered content
  can be passed as children to client components.`
}

export default async function DialogDemoPage() {
  // Fetch content on the server
  const termsContent = await getTermsContent()

  return (
    <main className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="font-bold text-3xl">Dialog Compound Component</h1>
        <p className="mt-2 text-muted-foreground">
          Compound API with server-rendered content inside client dialog.
        </p>
      </div>

      {/* Confirmation dialog example */}
      <section className="rounded-lg border bg-muted/50 p-6">
        <h2 className="font-semibold text-lg">Confirmation Dialog</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Gates a destructive action with user confirmation.
        </p>

        <DialogRoot>
          <DialogTrigger asChild>
            <Button type="button" variant="destructive">
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Your account and all associated
                data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" variant="destructive">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </section>

      {/* Server content inside dialog */}
      <section className="rounded-lg border bg-muted/50 p-6">
        <h2 className="font-semibold text-lg">Server Content in Dialog</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Terms content fetched on server, rendered inside client dialog.
        </p>

        <DialogRoot>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              View Terms
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Terms of Service</DialogTitle>
              <DialogDescription>
                Please read these terms carefully.
              </DialogDescription>
            </DialogHeader>
            {/* Server-rendered content passed through */}
            <div className="rounded-md bg-muted p-4 text-sm">
              {termsContent}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button">I Understand</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </section>

      {/* A11y notes */}
      <section className="rounded-lg border bg-muted/50 p-6">
        <h2 className="font-semibold text-lg">Accessibility Features</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
          <li>Focus trap: Tab cycles through dialog elements only</li>
          <li>Escape key: Closes the dialog</li>
          <li>Click outside: Closes the dialog</li>
          <li>ARIA: Title and Description linked via aria-labelledby/describedby</li>
          <li>Screen reader: Announces dialog open/close</li>
        </ul>
      </section>
    </main>
  )
}
```

### Step 4: Use the Dialog in Blog App

\*\*Note: Working Directory\*\*

This example switches to `apps/blog` to demonstrate **monorepo reusability**. The same Dialog component from `@repo/ui` works identically in both apps with zero modification. This validates that our compound component is truly shared infrastructure, not app-specific code.

Demonstrate the same component works across apps.

```tsx title="apps/blog/src/app/demo/dialog/page.tsx"
// Server Component - blog app also uses the shared Dialog

import { Button } from '@repo/ui/components/button'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog'

export default function BlogDialogDemoPage() {
  return (
    <main className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="font-bold text-3xl">Blog: Dialog Demo</h1>
        <p className="mt-2 text-muted-foreground">
          Same compound component from @repo/ui works in blog app.
        </p>
      </div>

      {/* Newsletter signup dialog */}
      <section className="rounded-lg border bg-muted/50 p-6">
        <h2 className="font-semibold text-lg">Newsletter Signup</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Example: gate newsletter subscription behind a dialog.
        </p>

        <DialogRoot>
          <DialogTrigger asChild>
            <Button type="button">Subscribe to Newsletter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Our Newsletter</DialogTitle>
              <DialogDescription>
                Get the latest articles delivered to your inbox.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="your@email.com"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Subscribe</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </DialogRoot>
      </section>
    </main>
  )
}
```

### File Structure

```
packages/ui/src/components/
└── dialog.tsx              # Compound component definition

apps/web/src/app/demo/dialog/
└── page.tsx                # Web app usage

apps/blog/src/app/demo/dialog/
└── page.tsx                # Blog app usage
```

### Verification

1. **Test focus trap:**
   - Open dialog, press Tab repeatedly
   - Focus should cycle through dialog elements only, not background

2. **Test escape close:**
   - Open dialog, press Escape
   - Dialog should close

3. **Test click outside:**
   - Open dialog, click the dark overlay
   - Dialog should close

4. **Test screen reader:**
   - Open browser DevTools → Accessibility panel
   - Verify dialog has proper ARIA attributes

5. **Test server content:**
   - Visit `/demo/dialog`, click "View Terms"
   - Content should show server-generated date

### Compound Pattern Benefits

| Feature         | Props Pattern             | Compound Pattern       |
| --------------- | ------------------------- | ---------------------- |
| Flexibility     | ❌ Fixed structure         | ✅ Any arrangement      |
| Readability     | ❌ Prop soup               | ✅ Clear structure      |
| TypeScript      | ❌ Complex unions          | ✅ Simple per-component |
| Server children | ❌ Serialize through props | ✅ Pass as children     |
| Customization   | ❌ Add more props          | ✅ Replace subcomponent |

### Troubleshooting

Component renders as empty or "Cannot read properties of undefined"

```
Error: Element type is invalid: expected a string (for built-in components)
or a class/function (for composite components) but got: undefined.
```

Or you see:

```
Cannot read properties of undefined (reading 'Root')
```

**Cause:** You're using namespace exports (`export const Dialog = { Root, Trigger, Content }`) which break during SSR/prerendering in Next.js 16. The namespace object exports as `undefined` in Server Components.

**Fix:** Use named exports instead of namespace exports:

```tsx title="packages/ui/src/components/dialog.tsx"
// ❌ BREAKS in Server Components
export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Content: DialogContent,
}

// ✅ WORKS
export {
  DialogRoot,
  DialogTrigger,
  DialogContent,
}
```

Then import individually:

```tsx title="apps/web/src/app/demo/dialog/page.tsx"
// ❌ BREAKS
import { Dialog } from '@repo/ui/components/dialog'
<Dialog.Root>...</Dialog.Root>

// ✅ WORKS
import { DialogRoot, DialogTrigger, DialogContent } from '@repo/ui/components/dialog'
<DialogRoot>...</DialogRoot>
```

The compound pattern still works, just with different import syntax.

\*\*Note: Still Stuck?\*\*

Ask your coding agent for help. Paste the error message and it can diagnose the issue.

\*\*Side Quest: Create a Polymorphic Component Library\*\*

## References

- <https://www.radix-ui.com/primitives/docs/overview/introduction>
- <https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading>


---

[Full course index](/academy/llms.txt) · [Sitemap](/academy/sitemap.md)
