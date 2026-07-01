import { createClient } from "@/lib/supabase/server";
import { getWeekBounds } from "@/lib/utils/date";
import { deriveWearWarnings } from "@/features/outfits/lib/derive-wear-warnings";
import type { WearWarning } from "@/features/outfits/lib/derive-wear-warnings";

export type WearHintsMap = Record<string, WearWarning[]>;

export async function getWearHints(todayISO: string): Promise<WearHintsMap> {
  const supabase = await createClient();
  const { start, end } = getWeekBounds(new Date(todayISO));

  const { data: lastWornRows, error: lastWornError } = await supabase
    .from("wear_history")
    .select("clothing_item_id, worn_date")
    .order("worn_date", { ascending: false });

  if (lastWornError) {
    throw new Error(lastWornError.message);
  }

  const { data: weekRows, error: weekError } = await supabase
    .from("wear_history")
    .select("clothing_item_id")
    .gte("worn_date", start)
    .lte("worn_date", end);

  if (weekError) {
    throw new Error(weekError.message);
  }

  const lastWornByItem = new Map<string, string>();
  for (const row of lastWornRows ?? []) {
    if (!lastWornByItem.has(row.clothing_item_id)) {
      lastWornByItem.set(row.clothing_item_id, row.worn_date);
    }
  }

  const weekCounts = new Map<string, number>();
  for (const row of weekRows ?? []) {
    weekCounts.set(
      row.clothing_item_id,
      (weekCounts.get(row.clothing_item_id) ?? 0) + 1,
    );
  }

  const itemIds = new Set([
    ...lastWornByItem.keys(),
    ...weekCounts.keys(),
  ]);

  const hints: WearHintsMap = {};
  for (const itemId of itemIds) {
    const warnings = deriveWearWarnings(
      lastWornByItem.get(itemId),
      weekCounts.get(itemId) ?? 0,
      todayISO,
    );
    if (warnings.length > 0) {
      hints[itemId] = warnings;
    }
  }

  return hints;
}
