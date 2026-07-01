import { clampDateToToday } from "@/lib/utils/date";

export function parseLogOutfitDate(
  searchParams: { date?: string },
  today: string,
): string {
  return clampDateToToday(searchParams.date ?? today, today) ?? today;
}
