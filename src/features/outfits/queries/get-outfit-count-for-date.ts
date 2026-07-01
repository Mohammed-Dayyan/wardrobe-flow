import { createClient } from "@/lib/supabase/server";

export async function getOutfitCountForDate(date: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("outfits")
    .select("id", { count: "exact", head: true })
    .eq("date", date);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
