import { createClient } from "@/lib/supabase/server";
import type { ClothingCategory } from "@/types/database";

export interface WardrobeSummary {
  total: number;
  top: number;
  pants: number;
  jacket: number;
  shoes: number;
}

const EMPTY_SUMMARY: WardrobeSummary = {
  total: 0,
  top: 0,
  pants: 0,
  jacket: 0,
  shoes: 0,
};

export async function getWardrobeSummary(): Promise<WardrobeSummary> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clothing_items")
    .select("category")
    .is("archived_at", null);

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.length) {
    return EMPTY_SUMMARY;
  }

  return data.reduce<WardrobeSummary>(
    (acc, row) => {
      acc.total += 1;
      acc[row.category as ClothingCategory] += 1;
      return acc;
    },
    { ...EMPTY_SUMMARY },
  );
}
