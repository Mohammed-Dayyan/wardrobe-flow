import { createClient } from "@/lib/supabase/server";
import { getClothingItem } from "@/features/wardrobe/queries/get-clothing-item";
import { ITEM_WEAR_HISTORY_PAGE_SIZE } from "@/features/wardrobe/constants/wear-history";
import type {
  DayType,
  ItemWearHistory,
  ItemWearHistoryEntry,
} from "@/types/database";

interface WearHistoryRow {
  id: string;
  worn_date: string;
  outfit_id: string;
  outfits: { day_type: DayType } | { day_type: DayType }[] | null;
}

function mapWearRow(row: WearHistoryRow): ItemWearHistoryEntry | null {
  const outfit = Array.isArray(row.outfits) ? row.outfits[0] : row.outfits;
  if (!outfit?.day_type) {
    return null;
  }

  return {
    id: row.id,
    worn_date: row.worn_date,
    outfit_id: row.outfit_id,
    day_type: outfit.day_type,
  };
}

export async function getItemWearHistory(
  itemId: string,
): Promise<ItemWearHistory | null> {
  const item = await getClothingItem(itemId);
  if (!item) {
    return null;
  }

  const supabase = await createClient();
  const pageSize = ITEM_WEAR_HISTORY_PAGE_SIZE;

  const [countResult, rowsResult, lastWornResult] = await Promise.all([
    supabase
      .from("wear_history")
      .select("id", { count: "exact", head: true })
      .eq("clothing_item_id", itemId),
    supabase
      .from("wear_history")
      .select(
        `
        id,
        worn_date,
        outfit_id,
        outfits (
          day_type
        )
      `,
      )
      .eq("clothing_item_id", itemId)
      .order("worn_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(pageSize),
    supabase
      .from("wear_history")
      .select("worn_date")
      .eq("clothing_item_id", itemId)
      .order("worn_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (countResult.error) {
    throw new Error(countResult.error.message);
  }
  if (rowsResult.error) {
    throw new Error(rowsResult.error.message);
  }
  if (lastWornResult.error) {
    throw new Error(lastWornResult.error.message);
  }

  const wearCount = countResult.count ?? 0;
  const entries = ((rowsResult.data ?? []) as WearHistoryRow[])
    .map(mapWearRow)
    .filter((entry): entry is ItemWearHistoryEntry => entry !== null);

  return {
    item,
    entries,
    wear_count: wearCount,
    last_worn_date: lastWornResult.data?.worn_date ?? null,
    has_more: wearCount > pageSize,
  };
}
