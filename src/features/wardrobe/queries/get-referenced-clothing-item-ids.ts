import { createClient } from "@/lib/supabase/server";

export async function getReferencedClothingItemIds(): Promise<Set<string>> {
  const supabase = await createClient();

  const [outfitItemsResult, wearHistoryResult] = await Promise.all([
    supabase.from("outfit_items").select("clothing_item_id"),
    supabase.from("wear_history").select("clothing_item_id"),
  ]);

  if (outfitItemsResult.error) {
    throw new Error(outfitItemsResult.error.message);
  }

  if (wearHistoryResult.error) {
    throw new Error(wearHistoryResult.error.message);
  }

  const ids = new Set<string>();

  for (const row of outfitItemsResult.data ?? []) {
    ids.add(row.clothing_item_id);
  }

  for (const row of wearHistoryResult.data ?? []) {
    ids.add(row.clothing_item_id);
  }

  return ids;
}
