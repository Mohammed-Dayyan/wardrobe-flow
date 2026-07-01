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

export async function updateOutfitAction(
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
    outfit_id: formData.get("outfit_id") ?? "",
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

  if (!parsed.data.outfit_id) {
    return { success: false, error: OUTFIT_ERRORS.NOT_FOUND };
  }

  if (parsed.data.date !== routeDate) {
    return { success: false, error: OUTFIT_ERRORS.DATE_MISMATCH };
  }

  const fingerprint = buildOutfitFingerprint(parsed.data);
  const existingOutfits = await getOutfitsForDate(routeDate);

  if (findDuplicateOutfit(existingOutfits, fingerprint, parsed.data.outfit_id)) {
    return { success: false, error: OUTFIT_ERRORS.DUPLICATE };
  }

  const supabase = await createClient();
  const slotParams = slotsToRpcParams(parsed.data);

  const { error } = await supabase.rpc("update_outfit", {
    p_outfit_id: parsed.data.outfit_id,
    p_day_type: parsed.data.day_type,
    p_notes: parsed.data.notes || null,
    ...slotParams,
  });

  if (error) {
    return { success: false, error: mapOutfitRpcError(error.message) };
  }

  revalidateOutfitPaths(routeDate);
  return { success: true };
}
