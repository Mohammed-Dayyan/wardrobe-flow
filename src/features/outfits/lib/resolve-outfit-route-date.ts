import { cookies } from "next/headers";
import { isDateISO } from "@/lib/utils/date";
import { TIMEZONE_COOKIE_NAME } from "@/lib/timezone/constants";
import { getUserTodayISO } from "@/lib/timezone/get-user-calendar";
import { parseOutfitRouteDate } from "@/features/outfits/lib/parse-outfit-route-date";

export async function resolveOutfitRouteDate(
  dateParam: string,
): Promise<{ date: string } | { pending: true } | { invalid: true }> {
  const cookieStore = await cookies();
  const hasTimezoneCookie = Boolean(cookieStore.get(TIMEZONE_COOKIE_NAME)?.value);

  if (!hasTimezoneCookie && isDateISO(dateParam)) {
    return { pending: true };
  }

  const today = await getUserTodayISO();
  const date = parseOutfitRouteDate(dateParam, today);

  if (!date) {
    return { invalid: true };
  }

  return { date };
}
