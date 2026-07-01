"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { getClothingItem } from "@/features/wardrobe/queries/get-clothing-item";
import { revalidateWardrobePaths } from "@/features/wardrobe/lib/revalidate-wardrobe-paths";
import { mapWardrobeDbError } from "@/features/wardrobe/lib/map-wardrobe-db-error";
import {
  WARDROBE_ERRORS,
  type WardrobeActionResult,
} from "@/features/wardrobe/types/action-result";

export async function archiveClothingItemAction(
  itemId: string,
): Promise<WardrobeActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: WARDROBE_ERRORS.UNAUTHORIZED };
  }

  const existing = await getClothingItem(itemId);
  if (!existing || existing.user_id !== user.id) {
    return { success: false, error: WARDROBE_ERRORS.NOT_FOUND };
  }

  if (existing.archived_at) {
    return { success: false, error: WARDROBE_ERRORS.ALREADY_ARCHIVED };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clothing_items")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", itemId);

  if (error) {
    console.error("archiveClothingItemAction:", error.message);
    return { success: false, error: mapWardrobeDbError(error.message) };
  }

  revalidateWardrobePaths(itemId);
  return { success: true, itemId };
}
