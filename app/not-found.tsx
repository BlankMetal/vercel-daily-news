import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24">
      <h1 className="text-6xl font-bold text-accent">404</h1>
      <p className="mt-4 text-lg text-muted">
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent/80"
      >
        Back to Home
      </Link>
    </div>
  );
}
