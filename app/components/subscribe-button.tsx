"use client";

import { useFormStatus } from "react-dom";
import { subscribeAction } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50"
    >
      {pending ? "Subscribing…" : "Subscribe"}
    </button>
  );
}

export function SubscribeButton() {
  return (
    <form action={subscribeAction}>
      <SubmitButton />
    </form>
  );
}
