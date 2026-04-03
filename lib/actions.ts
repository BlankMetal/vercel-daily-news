"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSubscription, subscribe, unsubscribe } from "./api";

const COOKIE_NAME = "vnews-sub-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function subscribeAction() {
  const { token } = await createSubscription();
  await subscribe(token);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  revalidatePath("/", "layout");
}

export async function unsubscribeAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await unsubscribe(token);
    cookieStore.delete(COOKIE_NAME);
  }

  revalidatePath("/", "layout");
}
