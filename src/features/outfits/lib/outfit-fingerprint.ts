import type { DayType } from "@/types/database";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";
import { getSlotItemId } from "@/features/outfits/lib/outfit-slot-values";

export interface OutfitFingerprintInput {
  day_type: DayType;
  top_id?: string;
  pants_id?: string;
  jacket_id?: string;
  shoes_id?: string;
}

function normalizeId(value?: string): string {
  return value && value.length > 0 ? value : "_";
}

export function buildOutfitFingerprint(values: OutfitFingerprintInput): string {
  return [
    `day:${values.day_type}`,
    `top:${normalizeId(values.top_id)}`,
    `pants:${normalizeId(values.pants_id)}`,
    `jacket:${normalizeId(values.jacket_id)}`,
    `shoes:${normalizeId(values.shoes_id)}`,
  ].join("|");
}

export function buildOutfitFingerprintFromOutfit(outfit: OutfitWithItems): string {
  return buildOutfitFingerprint({
    day_type: outfit.day_type,
    top_id: getSlotItemId(outfit, "top"),
    pants_id: getSlotItemId(outfit, "pants"),
    jacket_id: getSlotItemId(outfit, "jacket"),
    shoes_id: getSlotItemId(outfit, "shoes"),
  });
}

export function findDuplicateOutfit(
  outfits: OutfitWithItems[],
  fingerprint: string,
  excludeOutfitId?: string,
): OutfitWithItems | null {
  for (const outfit of outfits) {
    if (excludeOutfitId && outfit.id === excludeOutfitId) {
      continue;
    }

    if (buildOutfitFingerprintFromOutfit(outfit) === fingerprint) {
      return outfit;
    }
  }

  return null;
}
