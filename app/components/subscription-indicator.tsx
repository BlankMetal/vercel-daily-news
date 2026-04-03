import { getSubscriptionStatus } from "@/lib/subscription";
import { SubscribeButton } from "./subscribe-button";
import { SubscribedBadge } from "./subscribed-badge";

export async function SubscriptionIndicator() {
  const { isSubscribed } = await getSubscriptionStatus();

  return isSubscribed ? <SubscribedBadge /> : <SubscribeButton />;
}
