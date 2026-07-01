"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { getClothingItem } from "@/features/wardrobe/queries/get-clothing-item";
import { isItemReferenced } from "@/features/wardrobe/queries/is-item-referenced";
import { revalidateWardrobePaths } from "@/features/wardrobe/lib/revalidate-wardrobe-paths";
import { mapWardrobeDbError } from "@/features/wardrobe/lib/map-wardrobe-db-error";
import {
  WARDROBE_ERRORS,
  type WardrobeActionResult,
} from "@/features/wardrobe/types/action-result";

export async function deleteClothingItemAction(
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

  const referenceCheck = await isItemReferenced(itemId);

  if (referenceCheck.error) {
    return { success: false, error: referenceCheck.error };
  }

  if (referenceCheck.referenced) {
    return { success: false, error: WARDROBE_ERRORS.REFERENCED };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clothing_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("deleteClothingItemAction:", error.message);
    return { success: false, error: mapWardrobeDbError(error.message) };
  }

  revalidateWardrobePaths();

  return { success: true };
}
