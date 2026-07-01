import { createClient } from "@/lib/supabase/server";
import { addDaysISO } from "@/lib/utils/date";
import { formatOutfitItemsSummary } from "@/features/outfits/lib/format-outfit-summary";
import type { DayType } from "@/types/database";
import { getUserTodayISO } from "@/lib/timezone/get-user-calendar";

export interface RecentActivityItem {
  id: string;
  date: string;
  day_type: DayType;
  summary: string;
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const supabase = await createClient();
  const today = await getUserTodayISO();
  const sevenDaysAgo = addDaysISO(today, -6);

  const { data, error } = await supabase
    .from("outfits")
    .select(
      `
      id,
      date,
      day_type,
      created_at,
      outfit_items (
        role,
        clothing_items ( name )
      )
    `,
    )
    .gte("date", sevenDaysAgo)
    .lte("date", today)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const outfitItems = (row.outfit_items ?? []) as unknown as Array<{
      role: string;
      clothing_items: { name: string } | null;
    }>;

    return {
      id: row.id,
      date: row.date,
      day_type: row.day_type as DayType,
      summary: formatOutfitItemsSummary(outfitItems),
    };
  });
}
