import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_TIMEZONE,
  TIMEZONE_COOKIE_NAME,
} from "@/lib/timezone/constants";
import { isValidTimezone } from "@/lib/timezone/is-valid-timezone";

export async function getUserTimezone(): Promise<string> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(TIMEZONE_COOKIE_NAME)?.value;

  if (fromCookie && isValidTimezone(fromCookie)) {
    return fromCookie;
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("profiles")
      .select("timezone")
      .maybeSingle();

    if (data?.timezone && isValidTimezone(data.timezone)) {
      return data.timezone;
    }
  } catch {
    // Unauthenticated contexts fall back to UTC.
  }

  return DEFAULT_TIMEZONE;
}
