"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSubscription, subscribe, unsubscribe } from "./api";
import { SUBSCRIPTION_COOKIE, SUBSCRIPTION_COOKIE_MAX_AGE } from "./constants";

export async function subscribeAction() {
  const { token } = await createSubscription();
  await subscribe(token);

  const cookieStore = await cookies();
  cookieStore.set(SUBSCRIPTION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SUBSCRIPTION_COOKIE_MAX_AGE,
  });

  revalidatePath("/", "layout");
}

export async function unsubscribeAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUBSCRIPTION_COOKIE)?.value;

  if (token) {
    await unsubscribe(token);
    cookieStore.delete(SUBSCRIPTION_COOKIE);
  }

  revalidatePath("/", "layout");
}
