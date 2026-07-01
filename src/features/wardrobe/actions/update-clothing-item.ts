"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { getClothingItem } from "@/features/wardrobe/queries/get-clothing-item";
import { isItemReferenced } from "@/features/wardrobe/queries/is-item-referenced";
import { clothingItemFormSchema } from "@/features/wardrobe/schemas/clothing-item";
import { revalidateWardrobePaths } from "@/features/wardrobe/lib/revalidate-wardrobe-paths";
import { mapWardrobeDbError } from "@/features/wardrobe/lib/map-wardrobe-db-error";
import {
  WARDROBE_ERRORS,
  type WardrobeActionResult,
} from "@/features/wardrobe/types/action-result";

export async function updateClothingItemAction(
  itemId: string,
  formData: FormData,
): Promise<WardrobeActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: WARDROBE_ERRORS.UNAUTHORIZED };
  }

  const existing = await getClothingItem(itemId);
  if (!existing || existing.user_id !== user.id) {
    return { success: false, error: WARDROBE_ERRORS.NOT_FOUND };
  }

  const parsed = clothingItemFormSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    color: formData.get("color"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  if (parsed.data.category !== existing.category) {
    const referenceCheck = await isItemReferenced(itemId);

    if (referenceCheck.error) {
      return { success: false, error: referenceCheck.error };
    }

    if (referenceCheck.referenced) {
      return { success: false, error: WARDROBE_ERRORS.CATEGORY_LOCKED };
    }
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("clothing_items")
    .update({
      name: parsed.data.name,
      category: parsed.data.category,
      color: parsed.data.color,
      notes: parsed.data.notes || null,
    })
    .eq("id", itemId);

  if (error) {
    console.error("updateClothingItemAction:", error.message);
    return { success: false, error: mapWardrobeDbError(error.message) };
  }

  revalidateWardrobePaths(itemId);

  return { success: true, itemId };
}
