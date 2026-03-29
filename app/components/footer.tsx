export async function Footer() {
  "use cache";

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} Vercel Daily News
        </p>
      </div>
    </footer>
  );
}
