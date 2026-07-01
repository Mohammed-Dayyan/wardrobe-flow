import { createClient } from "@/lib/supabase/server";
import type { ClothingItem, Outfit, OutfitItemRole } from "@/types/database";

export interface OutfitItemWithClothing {
  role: OutfitItemRole;
  clothing_item_id: string;
  clothing_items: Pick<ClothingItem, "id" | "name" | "color" | "category">;
}

export interface OutfitWithItems extends Outfit {
  outfit_items: OutfitItemWithClothing[];
}

const OUTFIT_SELECT = `
  *,
  outfit_items (
    role,
    clothing_item_id,
    clothing_items (
      id,
      name,
      color,
      category
    )
  )
`;

export async function getOutfitsForDate(
  date: string,
): Promise<OutfitWithItems[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("outfits")
    .select(OUTFIT_SELECT)
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as OutfitWithItems[];
}

export async function getOutfitById(
  outfitId: string,
): Promise<OutfitWithItems | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("outfits")
    .select(OUTFIT_SELECT)
    .eq("id", outfitId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as OutfitWithItems | null;
}

/** @deprecated Use getOutfitsForDate - returns first outfit for backward compat during migration */
export async function getOutfitByDate(
  date: string,
): Promise<OutfitWithItems | null> {
  const outfits = await getOutfitsForDate(date);
  return outfits[0] ?? null;
}
