import {
  getCalendarDateISO,
  getCalendarMonthParam,
} from "@/lib/timezone/calendar-date";
import { getUserTimezone } from "@/lib/timezone/get-user-timezone";

export async function getUserTodayISO(reference: Date = new Date()): Promise<string> {
  const timeZone = await getUserTimezone();
  return getCalendarDateISO(timeZone, reference);
}

export async function getUserCurrentMonthParam(
  reference: Date = new Date(),
): Promise<string> {
  const timeZone = await getUserTimezone();
  return getCalendarMonthParam(timeZone, reference);
}

export async function getUserCalendarContext(reference: Date = new Date()) {
  const timeZone = await getUserTimezone();

  return {
    timeZone,
    today: getCalendarDateISO(timeZone, reference),
    currentMonth: getCalendarMonthParam(timeZone, reference),
  };
}
