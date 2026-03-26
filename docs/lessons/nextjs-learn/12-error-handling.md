# Chapter 12: Handling Errors

In the previous chapter, you learned how to mutate data using Server Actions. Let's see how you can handle errors _gracefully_ using JavaScript's `try/catch` statements and Next.js APIs.

## In this chapter...

- How to use the special `error.tsx` file to catch errors in your route segments, and show a fallback UI to the user.
- How to use the `notFound` function and `not-found` file to handle 404 errors (for resources that don't exist).

## Adding `try/catch` to Server Actions

First, let's add JavaScript's `try/catch` statements to your Server Actions to allow you to handle errors gracefully.

Note how `redirect` is being called outside of the `try/catch` block. This is because `redirect` works by throwing an error, which would be caught by the `catch` block. To avoid this, you can call `redirect` **after** `try/catch`. `redirect` would only be reachable if `try` is successful.

## Handling all errors with `error.tsx`

The `error.tsx` file can be used to define a UI boundary for a route segment. It serves as a **catch-all** for unexpected errors and allows you to display a fallback UI to your users.

Inside your `/dashboard/invoices` folder, create a new file called `error.tsx` and paste the following code:

```typescript
// /dashboard/invoices/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Something went wrong!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={() => reset()}
      >
        Try again
      </button>
    </main>
  );
}
```

There are a few things you'll notice about the code above:

- **"use client"** - `error.tsx` needs to be a Client Component.
- It accepts two props:
  - `error`: This object is an instance of JavaScript's native `Error` object.
  - `reset`: This is a function to reset the error boundary. When executed, the function will try to re-render the route segment.

## Handling 404 errors with the `notFound` function

Another way you can handle errors gracefully is by using the `notFound` function. While `error.tsx` is useful for catching uncaught exceptions, `notFound` can be used when you try to fetch a resource that doesn't exist.

You can confirm that the resource hasn't been found by going into your `fetchInvoiceById` function in `data.ts`.

Now that you know the invoice doesn't exist in your database, let's use `notFound` to handle it. Navigate to `/dashboard/invoices/[id]/edit/page.tsx`, and import `{ notFound }` from `'next/navigation'`.

Then, you can use a conditional to invoke `notFound` if the invoice doesn't exist:

```typescript
// /dashboard/invoices/[id]/edit/page.tsx
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  if (!invoice) {
    notFound();
  }

  // ...
}
```

Then, to show error UI to the user, create a `not-found.tsx` file inside the `/edit` folder:

```typescript
// /dashboard/invoices/[id]/edit/not-found.tsx
import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="w-10 text-gray-400" />
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>Could not find the requested invoice.</p>
      <Link
        href="/dashboard/invoices"
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
      >
        Go Back
      </Link>
    </main>
  );
}
```

That's something to keep in mind: `notFound` will take precedence over `error.tsx`, so you can reach out for it when you want to handle more specific errors!

## Further reading

- [Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [`error.js` API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/error)
- [`notFound()` API Reference](https://nextjs.org/docs/app/api-reference/functions/not-found)
- [`not-found.js` API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
