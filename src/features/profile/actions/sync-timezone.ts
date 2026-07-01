"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import {
  DEFAULT_TIMEZONE,
  TIMEZONE_COOKIE_MAX_AGE_SECONDS,
  TIMEZONE_COOKIE_NAME,
} from "@/lib/timezone/constants";
import { isValidTimezone } from "@/lib/timezone/is-valid-timezone";

export async function syncUserTimezoneAction(
  timeZone: string,
): Promise<{ success: boolean }> {
  if (!isValidTimezone(timeZone)) {
    return { success: false };
  }

  const cookieStore = await cookies();
  cookieStore.set(TIMEZONE_COOKIE_NAME, timeZone, {
    path: "/",
    sameSite: "lax",
    maxAge: TIMEZONE_COOKIE_MAX_AGE_SECONDS,
  });

  const user = await getUser();
  if (!user) {
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ timezone: timeZone })
    .eq("id", user.id);

  if (error) {
    return { success: false };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function clearUserTimezoneCookieAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TIMEZONE_COOKIE_NAME, DEFAULT_TIMEZONE, {
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });
}
