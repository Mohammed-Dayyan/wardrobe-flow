"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { mapWardrobeDbError } from "@/features/wardrobe/lib/map-wardrobe-db-error";
import { revalidateWardrobePaths } from "@/features/wardrobe/lib/revalidate-wardrobe-paths";
import { clothingItemFormSchema } from "@/features/wardrobe/schemas/clothing-item";
import {
  WARDROBE_ERRORS,
  type WardrobeActionResult,
} from "@/features/wardrobe/types/action-result";

export async function createClothingItemAction(
  formData: FormData,
): Promise<WardrobeActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: WARDROBE_ERRORS.UNAUTHORIZED };
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

  const supabase = await createClient();

  const { data: item, error } = await supabase
    .from("clothing_items")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      category: parsed.data.category,
      color: parsed.data.color,
      notes: parsed.data.notes || null,
      image_url: null,
    })
    .select("id")
    .single();

  if (error || !item) {
    return {
      success: false,
      error: error
        ? mapWardrobeDbError(error.message)
        : WARDROBE_ERRORS.SAVE_FAILED,
    };
  }

  revalidateWardrobePaths();

  return { success: true, itemId: item.id };
}
