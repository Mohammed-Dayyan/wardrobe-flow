import { createClient } from "@/lib/supabase/server";
import type { DayType } from "@/types/database";
import { formatOutfitItemsSummary } from "@/features/outfits/lib/format-outfit-summary";

export const HISTORY_PAGE_SIZE = 20;

export interface HistoryTimelineItem {
  id: string;
  date: string;
  day_type: DayType;
  summary: string;
  notes: string | null;
}

export interface HistoryTimelineResult {
  items: HistoryTimelineItem[];
  page: number;
  hasMore: boolean;
}

export async function getHistoryTimeline(
  page: number,
): Promise<HistoryTimelineResult> {
  const supabase = await createClient();
  const safePage = Math.max(1, page);
  const to = safePage * HISTORY_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("outfits")
    .select(
      `
      id,
      date,
      day_type,
      notes,
      created_at,
      outfit_items (
        role,
        clothing_items ( name )
      )
    `,
      { count: "exact" },
    )
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(0, to);

  if (error) {
    throw new Error(error.message);
  }

  const items = (data ?? []).map((row) => {
    const outfitItems = (row.outfit_items ?? []) as unknown as Array<{
      role: string;
      clothing_items: { name: string } | null;
    }>;

    return {
      id: row.id,
      date: row.date,
      day_type: row.day_type as DayType,
      summary: formatOutfitItemsSummary(outfitItems),
      notes: row.notes,
    };
  });

  const total = count ?? 0;
  const hasMore = safePage * HISTORY_PAGE_SIZE < total;

  return { items, page: safePage, hasMore };
}
