import type { ClothingItem } from "@/types/database";

/** Sentinel value for the placeholder option in outfit item selects. */
export const PICKER_PLACEHOLDER = "__picker_placeholder__";

export function formatPickerItemLabel(item: ClothingItem): string {
  return `${item.name} · ${item.color}`;
}

export function findPickerItem(
  items: ClothingItem[],
  id: string,
): ClothingItem | undefined {
  return items.find((item) => item.id === id);
}

export function toPickerValue(selectedId: string): string {
  return selectedId || PICKER_PLACEHOLDER;
}

export function fromPickerValue(value: string | null): string {
  if (!value || value === PICKER_PLACEHOLDER) {
    return "";
  }
  return value;
}
