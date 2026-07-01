import { createClient } from "@/lib/supabase/server";
import type { ClothingItem } from "@/types/database";
import type { ClothingCategory } from "@/lib/validations/categories";
import { CLOTHING_CATEGORIES } from "@/lib/validations/categories";

export interface PickerItemsOptions {
  includeItemIds?: string[];
}

export async function getPickerItems(
  options: PickerItemsOptions = {},
): Promise<Record<ClothingCategory, ClothingItem[]>> {
  const supabase = await createClient();
  const includeItemIds = (options.includeItemIds ?? []).filter(Boolean);

  const { data: activeItems, error: activeError } = await supabase
    .from("clothing_items")
    .select("*")
    .is("archived_at", null)
    .order("name", { ascending: true });

  if (activeError) {
    throw new Error(activeError.message);
  }

  let items = (activeItems ?? []) as ClothingItem[];

  const missingIds = includeItemIds.filter(
    (id) => !items.some((item) => item.id === id),
  );

  if (missingIds.length > 0) {
    const { data: extraItems, error: extraError } = await supabase
      .from("clothing_items")
      .select("*")
      .in("id", missingIds);

    if (extraError) {
      throw new Error(extraError.message);
    }

    items = [...items, ...((extraItems ?? []) as ClothingItem[])];
    items.sort((a, b) => a.name.localeCompare(b.name));
  }

  return CLOTHING_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = items.filter((item) => item.category === category);
      return acc;
    },
    {} as Record<ClothingCategory, ClothingItem[]>,
  );
}
