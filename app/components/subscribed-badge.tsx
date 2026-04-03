"use client";

import { useState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { unsubscribeAction } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-left text-sm text-muted hover:bg-border hover:text-white disabled:opacity-50"
    >
      {pending ? "Unsubscribing…" : "Unsubscribe"}
    </button>
  );
}

export function SubscribedBadge() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent hover:bg-accent/20"
      >
        Subscribed
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          <form action={unsubscribeAction}>
            <SubmitButton />
          </form>
        </div>
      )}
    </div>
  );
}
