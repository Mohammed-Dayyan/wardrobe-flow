import { createClient } from "@/lib/supabase/server";
import { computeLoggingStreak } from "@/features/dashboard/lib/compute-streak";
import {
  addDaysISO,
  getMonthBounds,
} from "@/lib/utils/date";
import {
  getUserCalendarContext,
} from "@/lib/timezone/get-user-calendar";

const STREAK_LOOKBACK_DAYS = 400;

export interface DashboardStats {
  monthLogCount: number;
  officeDaysThisMonth: number;
  streak: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const { today, currentMonth: month } = await getUserCalendarContext();
  const { start, end } = getMonthBounds(month);
  const streakWindowStart = addDaysISO(today, -STREAK_LOOKBACK_DAYS);

  const [monthOutfitsResult, streakOutfitsResult, breakdownResult] =
    await Promise.all([
      supabase
        .from("outfits")
        .select("date", { count: "exact", head: true })
        .gte("date", start)
        .lte("date", end),
      supabase
        .from("outfits")
        .select("date")
        .gte("date", streakWindowStart)
        .lte("date", today)
        .order("date", {
          ascending: false,
        }),
      supabase.rpc("get_day_type_breakdown", { p_month: month }),
    ]);

  if (monthOutfitsResult.error) {
    throw new Error(monthOutfitsResult.error.message);
  }

  if (streakOutfitsResult.error) {
    throw new Error(streakOutfitsResult.error.message);
  }

  if (breakdownResult.error) {
    throw new Error(breakdownResult.error.message);
  }

  const loggedDates = (streakOutfitsResult.data ?? []).map((row) => row.date);
  const officeRow = (breakdownResult.data ?? []).find(
    (row: { day_type: string; count: number }) => row.day_type === "office",
  );

  return {
    monthLogCount: monthOutfitsResult.count ?? 0,
    officeDaysThisMonth: Number(officeRow?.count ?? 0),
    streak: computeLoggingStreak(loggedDates, today),
  };
}
