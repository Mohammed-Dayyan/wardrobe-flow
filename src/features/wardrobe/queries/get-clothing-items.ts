import { createClient } from "@/lib/supabase/server";
import type { ClothingCategory, ClothingItem } from "@/types/database";

export interface ClothingItemsFilter {
  category?: ClothingCategory;
  search?: string;
  includeArchived?: boolean;
}

export async function getClothingItems(
  filters: ClothingItemsFilter = {},
): Promise<ClothingItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("clothing_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (!filters.includeArchived) {
    query = query.is("archived_at", null);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ClothingItem[];
}
