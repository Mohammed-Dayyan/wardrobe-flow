import { getPickerItems } from "@/features/outfits/queries/get-picker-items";
import { getOutfitById } from "@/features/outfits/queries/get-outfit-by-date";
import { getOutfitCountForDate } from "@/features/outfits/queries/get-outfit-count-for-date";
import { getOutfitsForDate } from "@/features/outfits/queries/get-outfit-by-date";
import { getWearHints } from "@/features/outfits/queries/get-wear-hints";
import { MAX_OUTFITS_PER_DAY } from "@/features/outfits/constants/outfit-limits";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";

function getOutfitClothingItemIds(outfit: OutfitWithItems): string[] {
  return outfit.outfit_items
    .map((item) => item.clothing_item_id)
    .filter(Boolean);
}

export async function getDayHubContext(date: string) {
  const [outfits, outfitCount, pickerItems, wearHints] = await Promise.all([
    getOutfitsForDate(date),
    getOutfitCountForDate(date),
    getPickerItems(),
    getWearHints(date),
  ]);

  return {
    date,
    outfits,
    outfitCount,
    canAddOutfit: outfitCount < MAX_OUTFITS_PER_DAY,
    pickerItems,
    wearHints,
  };
}

export async function getCreateOutfitContext(date: string) {
  const [pickerItems, wearHints, outfitCount] = await Promise.all([
    getPickerItems(),
    getWearHints(date),
    getOutfitCountForDate(date),
  ]);

  return {
    date,
    mode: "create" as const,
    outfit: null,
    pickerItems,
    wearHints,
    canAddOutfit: outfitCount < MAX_OUTFITS_PER_DAY,
  };
}

export async function getEditOutfitContext(outfitId: string) {
  const outfit = await getOutfitById(outfitId);

  if (!outfit) {
    return null;
  }

  const includeItemIds = getOutfitClothingItemIds(outfit);

  const [pickerItems, wearHints] = await Promise.all([
    getPickerItems({ includeItemIds }),
    getWearHints(outfit.date),
  ]);

  return {
    date: outfit.date,
    mode: "edit" as const,
    outfit,
    pickerItems,
    wearHints,
    canAddOutfit: true,
  };
}
