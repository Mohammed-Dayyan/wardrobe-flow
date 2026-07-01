export interface OutfitItemForSummary {
  clothing_items: { name: string } | null;
}

export function hasOutfitItems(
  items: OutfitItemForSummary[] | null | undefined,
): boolean {
  return (items?.length ?? 0) > 0;
}

export function formatOutfitItemsSummary(
  items: OutfitItemForSummary[] | null | undefined,
): string {
  if (!items?.length) {
    return "";
  }

  return items
    .map((item) => item.clothing_items?.name)
    .filter(Boolean)
    .join(" · ");
}
