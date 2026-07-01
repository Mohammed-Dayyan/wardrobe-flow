import { addDaysISO, getTodayISO } from "@/lib/utils/date";

export function computeLoggingStreak(
  loggedDates: string[],
  today: string = getTodayISO(),
): number {
  if (loggedDates.length === 0) {
    return 0;
  }

  const logged = new Set(loggedDates);
  let cursor = logged.has(today) ? today : addDaysISO(today, -1);

  if (!logged.has(cursor)) {
    return 0;
  }

  let streak = 0;

  while (logged.has(cursor)) {
    streak += 1;
    cursor = addDaysISO(cursor, -1);
  }

  return streak;
}
