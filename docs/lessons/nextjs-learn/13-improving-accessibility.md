# Chapter 13: Improving Accessibility

In the previous chapter, we looked at how to catch errors (including 404 errors) and display a fallback to the user. However, we still need to discuss another piece of the puzzle: form validation. Let's see how to implement server-side validation with Server Actions, and how you can show form errors using React's `useActionState` hook - while keeping accessibility in mind!

## In this chapter...

- How to use `eslint-plugin-jsx-a11y` with Next.js to implement accessibility best practices.
- How to implement server-side form validation.
- How to use the React `useActionState` hook to handle form errors, and display them to the user.

## What is accessibility?

Accessibility refers to designing and implementing web applications that everyone can use, including those with disabilities. It's a vast topic that covers many areas, such as keyboard navigation, semantic HTML, images, colors, videos, etc.

## Using the ESLint accessibility plugin in Next.js

Next.js's ESLint configuration includes the `eslint-plugin-jsx-a11y` plugin, which helps catch accessibility issues early.

Install ESLint:

```bash
pnpm add -D eslint eslint-config-next
```

Create an `eslint.config.mjs` file:

```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
```

Add a `lint` script to your `package.json`:

```json
"scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start",
    "lint": "eslint ."
}
```

Then run `pnpm lint` in your terminal.

## Improving form accessibility

There are three things we're already doing to improve accessibility in our forms:

- **Semantic HTML**: Using semantic elements (`<input>`, `<option>`, etc) instead of `<div>`.
- **Labelling**: Including `<label>` and the `htmlFor` attribute ensures that each form field has a descriptive text label.
- **Focus Outline**: The fields are properly styled to show an outline when they are in focus.

## Form validation

### Client-Side validation

The simplest approach is to rely on the form validation provided by the browser by adding the `required` attribute to the `<input>` and `<select>` elements.

### Server-Side validation

By validating forms on the server, you can:

- Ensure your data is in the expected format before sending it to your database.
- Reduce the risk of malicious users bypassing client-side validation.
- Have one source of truth for what is considered _valid_ data.

In your `create-form.tsx` component, import the `useActionState` hook from `react`:

```typescript
// /app/ui/invoices/create-form.tsx
'use client';

import { useActionState } from 'react';
import { createInvoice, State } from '@/app/lib/actions';

export default function Form({ customers }: { customers: CustomerField[] }) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);

  return <form action={formAction}>...</form>;
}
```

In your `action.ts` file, update the `FormSchema` with Zod validation messages:

```typescript
// /app/lib/actions.ts
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
```

Update the `createInvoice` action to accept `prevState` and use `safeParse()`:

```typescript
// /app/lib/actions.ts
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
```

Then display errors in your form component using aria labels:

```typescript
// /app/ui/invoices/create-form.tsx
<div id="customer-error" aria-live="polite" aria-atomic="true">
  {state.errors?.customerId &&
    state.errors.customerId.map((error: string) => (
      <p className="mt-2 text-sm text-red-500" key={error}>
        {error}
      </p>
    ))}
</div>
```

The aria labels:

- `aria-describedby="customer-error"`: Establishes a relationship between the `select` element and the error message container.
- `id="customer-error"`: Uniquely identifies the HTML element that holds the error message.
- `aria-live="polite"`: The screen reader should politely notify the user when the error inside the `div` is updated.
