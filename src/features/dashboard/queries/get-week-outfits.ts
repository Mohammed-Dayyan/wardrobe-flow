import { createClient } from "@/lib/supabase/server";
import type { DayType } from "@/types/database";
import {
  addDaysISO,
  getWeekBounds,
  parseDateISO,
} from "@/lib/utils/date";
import { getUserTodayISO } from "@/lib/timezone/get-user-calendar";

export interface WeekOutfitDay {
  date: string;
  day_type: DayType | null;
  dayTypes: DayType[];
  outfitCount: number;
  isToday: boolean;
}

export async function getWeekOutfits(): Promise<WeekOutfitDay[]> {
  const supabase = await createClient();
  const today = await getUserTodayISO();
  const { start, end } = getWeekBounds(parseDateISO(today));

  const { data, error } = await supabase
    .from("outfits")
    .select("date, day_type")
    .gte("date", start)
    .lte("date", end)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const outfitsByDate = new Map<
    string,
    { dayTypes: DayType[]; count: number }
  >();

  for (const row of data ?? []) {
    const dayType = row.day_type as DayType;
    const existing = outfitsByDate.get(row.date);

    if (existing) {
      existing.count += 1;
      if (!existing.dayTypes.includes(dayType)) {
        existing.dayTypes.push(dayType);
      }
    } else {
      outfitsByDate.set(row.date, {
        dayTypes: [dayType],
        count: 1,
      });
    }
  }

  const days: WeekOutfitDay[] = [];
  let cursor = start;

  while (cursor <= end) {
    const entry = outfitsByDate.get(cursor);
    days.push({
      date: cursor,
      day_type: entry?.dayTypes[0] ?? null,
      dayTypes: entry?.dayTypes ?? [],
      outfitCount: entry?.count ?? 0,
      isToday: cursor === today,
    });
    cursor = addDaysISO(cursor, 1);
  }

  return days;
}
