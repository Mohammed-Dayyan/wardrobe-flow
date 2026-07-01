import { createClient } from "@/lib/supabase/server";
import { getMonthBounds } from "@/lib/utils/date";
import type { DayType } from "@/types/database";

export interface HistoryMonthDay {
  date: string;
  day_type: DayType;
  outfitCount: number;
}

export async function getHistoryMonth(
  monthParam: string,
): Promise<HistoryMonthDay[]> {
  const supabase = await createClient();
  const { start, end } = getMonthBounds(monthParam);

  const { data, error } = await supabase
    .from("outfits")
    .select("date, day_type")
    .gte("date", start)
    .lte("date", end)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const byDate = new Map<string, { day_type: DayType; count: number }>();

  for (const row of data ?? []) {
    const existing = byDate.get(row.date);
    if (existing) {
      existing.count += 1;
    } else {
      byDate.set(row.date, {
        day_type: row.day_type as DayType,
        count: 1,
      });
    }
  }

  return Array.from(byDate.entries()).map(([date, entry]) => ({
    date,
    day_type: entry.day_type,
    outfitCount: entry.count,
  }));
}
