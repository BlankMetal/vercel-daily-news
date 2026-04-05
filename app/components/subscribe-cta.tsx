import { getSubscriptionStatus } from "@/lib/subscription";
import { SubscribeButton } from "./subscribe-button";

export async function SubscribeCTA() {
  const { isSubscribed } = await getSubscriptionStatus();

  if (isSubscribed) return null;

  return (
    <div className="rounded-lg border border-border bg-surface p-8 text-center">
      <h2 className="text-xl font-bold">Subscribe to continue reading</h2>
      <p className="mt-2 text-muted">
        Get full access to all articles on Vercel Daily News.
      </p>
      <div className="mt-4">
        <SubscribeButton />
      </div>
    </div>
  );
}
