import { createClient } from "@/lib/supabase/server";
import { getUserTodayISO } from "@/lib/timezone/get-user-calendar";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";

export async function getTodayOutfits(): Promise<OutfitWithItems[]> {
  const supabase = await createClient();
  const today = await getUserTodayISO();

  const { data, error } = await supabase
    .from("outfits")
    .select(
      `
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
    `,
    )
    .eq("date", today)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as OutfitWithItems[];
}

/** @deprecated Use getTodayOutfits */
export async function getTodayOutfit(): Promise<OutfitWithItems | null> {
  const outfits = await getTodayOutfits();
  return outfits[0] ?? null;
}
