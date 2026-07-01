"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { mapOutfitRpcError } from "@/features/outfits/lib/map-outfit-rpc-error";
import { revalidateOutfitPaths } from "@/features/outfits/lib/revalidate-outfit-paths";
import { getOutfitById } from "@/features/outfits/queries/get-outfit-by-date";
import {
  OUTFIT_ERRORS,
  type OutfitActionResult,
} from "@/features/outfits/types/action-result";

export async function deleteOutfitByIdAction(
  outfitId: string,
): Promise<OutfitActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: OUTFIT_ERRORS.UNAUTHORIZED };
  }

  if (!outfitId) {
    return { success: false, error: OUTFIT_ERRORS.NOT_FOUND };
  }

  const outfit = await getOutfitById(outfitId);
  if (!outfit) {
    return { success: false, error: OUTFIT_ERRORS.NOT_FOUND };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("delete_outfit_by_id", {
    p_outfit_id: outfitId,
  });

  if (error) {
    return { success: false, error: mapOutfitRpcError(error.message) };
  }

  revalidateOutfitPaths(outfit.date);
  return { success: true };
}
