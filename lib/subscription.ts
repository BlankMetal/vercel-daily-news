import { cookies } from "next/headers";
import { getSubscription } from "./api";
import { SUBSCRIPTION_COOKIE } from "./constants";

export async function getSubscriptionStatus(): Promise<{
  isSubscribed: boolean;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUBSCRIPTION_COOKIE)?.value;

  if (!token) {
    return { isSubscribed: false };
  }

  try {
    const subscription = await getSubscription(token);
    return { isSubscribed: subscription.status === "active" };
  } catch {
    return { isSubscribed: false };
  }
}
