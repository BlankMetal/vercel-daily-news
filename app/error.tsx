"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24">
      <h1 className="text-6xl font-bold text-accent">Error</h1>
      <p className="mt-4 text-lg text-muted">
        Something went wrong. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent/80"
      >
        Try Again
      </button>
    </div>
  );
}
