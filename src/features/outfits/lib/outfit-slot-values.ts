import {
  OUTFIT_SLOT_FORM_KEYS,
  OUTFIT_SLOT_ORDER,
} from "@/features/outfits/constants/outfit-slots";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";
import type { ClothingCategory } from "@/lib/validations/categories";
import type { OutfitFormValues } from "@/features/outfits/schemas/outfit";

export function getSlotItemId(
  outfit: OutfitWithItems | null | undefined,
  slot: ClothingCategory,
): string {
  return (
    outfit?.outfit_items.find((item) => item.role === slot)?.clothing_item_id ??
    ""
  );
}

export function buildSlotFormDefaults(
  date: string,
  outfit?: OutfitWithItems | null,
): Pick<
  OutfitFormValues,
  "date" | "day_type" | "notes" | "top_id" | "pants_id" | "jacket_id" | "shoes_id"
> {
  return {
    date,
    day_type: outfit?.day_type ?? "office",
    notes: outfit?.notes ?? "",
    top_id: getSlotItemId(outfit, "top"),
    pants_id: getSlotItemId(outfit, "pants"),
    jacket_id: getSlotItemId(outfit, "jacket"),
    shoes_id: getSlotItemId(outfit, "shoes"),
  };
}

export function slotToFormField(slot: ClothingCategory): keyof OutfitFormValues {
  return OUTFIT_SLOT_FORM_KEYS[slot] as keyof OutfitFormValues;
}

export function slotsToRpcParams(values: OutfitFormValues) {
  return {
    p_top_id: toNullableId(values.top_id),
    p_pants_id: toNullableId(values.pants_id),
    p_jacket_id: toNullableId(values.jacket_id),
    p_shoes_id: toNullableId(values.shoes_id),
  };
}

function toNullableId(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

export function getOptionalSlots(): ClothingCategory[] {
  return OUTFIT_SLOT_ORDER.filter(
    (slot) => !["top", "pants"].includes(slot),
  );
}
