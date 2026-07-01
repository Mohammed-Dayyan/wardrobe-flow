"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { createOutfitFormSchema } from "@/features/outfits/schemas/outfit";
import {
  buildOutfitFingerprint,
  findDuplicateOutfit,
} from "@/features/outfits/lib/outfit-fingerprint";
import { mapOutfitRpcError } from "@/features/outfits/lib/map-outfit-rpc-error";
import { slotsToRpcParams } from "@/features/outfits/lib/outfit-slot-values";
import { revalidateOutfitPaths } from "@/features/outfits/lib/revalidate-outfit-paths";
import { getOutfitsForDate } from "@/features/outfits/queries/get-outfit-by-date";
import {
  OUTFIT_ERRORS,
  type OutfitActionResult,
} from "@/features/outfits/types/action-result";
import { getUserTodayISO } from "@/lib/timezone/get-user-calendar";
import { getUserTimezone } from "@/lib/timezone/get-user-timezone";

export async function createOutfitAction(
  formData: FormData,
  routeDate: string,
): Promise<OutfitActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: OUTFIT_ERRORS.UNAUTHORIZED };
  }

  const today = await getUserTodayISO();
  const parsed = createOutfitFormSchema(today).safeParse({
    date: formData.get("date"),
    day_type: formData.get("day_type"),
    notes: formData.get("notes") ?? "",
    top_id: formData.get("top_id") ?? "",
    pants_id: formData.get("pants_id") ?? "",
    jacket_id: formData.get("jacket_id") ?? "",
    shoes_id: formData.get("shoes_id") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  if (parsed.data.date !== routeDate) {
    return { success: false, error: OUTFIT_ERRORS.DATE_MISMATCH };
  }

  const fingerprint = buildOutfitFingerprint(parsed.data);
  const existingOutfits = await getOutfitsForDate(routeDate);

  if (findDuplicateOutfit(existingOutfits, fingerprint)) {
    return { success: false, error: OUTFIT_ERRORS.DUPLICATE };
  }

  const supabase = await createClient();
  const slotParams = slotsToRpcParams(parsed.data);
  const timeZone = await getUserTimezone();

  const { error } = await supabase.rpc("create_outfit", {
    p_date: routeDate,
    p_day_type: parsed.data.day_type,
    p_notes: parsed.data.notes || null,
    p_timezone: timeZone,
    ...slotParams,
  });

  if (error) {
    return { success: false, error: mapOutfitRpcError(error.message) };
  }

  revalidateOutfitPaths(routeDate);
  return { success: true };
}
