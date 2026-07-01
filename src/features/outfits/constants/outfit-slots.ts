import type { ClothingCategory } from "@/lib/validations/categories";

export const OUTFIT_SLOT_ORDER: ClothingCategory[] = [
  "top",
  "pants",
  "jacket",
  "shoes",
];

export const OFFICE_REQUIRED_SLOTS: ClothingCategory[] = ["top", "pants"];

export const OUTFIT_SLOT_FORM_KEYS = {
  top: "top_id",
  pants: "pants_id",
  jacket: "jacket_id",
  shoes: "shoes_id",
} as const satisfies Record<ClothingCategory, string>;

export type OutfitSlotFormKey =
  (typeof OUTFIT_SLOT_FORM_KEYS)[ClothingCategory];
