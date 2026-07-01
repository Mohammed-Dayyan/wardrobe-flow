import { createClient } from "@/lib/supabase/server";
import type { ClothingItem } from "@/types/database";

export async function getClothingItem(
  id: string,
): Promise<ClothingItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clothing_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ClothingItem | null;
}
