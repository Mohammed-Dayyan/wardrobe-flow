import { createClient } from "@/lib/supabase/server";

export type ItemReferenceResult =
  | { referenced: boolean; error?: undefined }
  | { referenced: false; error: string };

export async function isItemReferenced(
  itemId: string,
): Promise<ItemReferenceResult> {
  const supabase = await createClient();

  const [outfitItems, wearHistory] = await Promise.all([
    supabase
      .from("outfit_items")
      .select("id", { count: "exact", head: true })
      .eq("clothing_item_id", itemId),
    supabase
      .from("wear_history")
      .select("id", { count: "exact", head: true })
      .eq("clothing_item_id", itemId),
  ]);

  if (outfitItems.error) {
    console.error("isItemReferenced outfit_items:", outfitItems.error.message);
    return {
      referenced: false,
      error: "Could not verify whether this item is used in outfits.",
    };
  }

  if (wearHistory.error) {
    console.error("isItemReferenced wear_history:", wearHistory.error.message);
    return {
      referenced: false,
      error: "Could not verify whether this item is used in outfits.",
    };
  }

  const referenced =
    (outfitItems.count ?? 0) > 0 || (wearHistory.count ?? 0) > 0;

  return { referenced };
}
