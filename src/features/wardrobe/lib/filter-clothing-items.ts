import type { ClothingCategory, ClothingItem } from "@/types/database";

export interface ClothingItemsFilter {
  category?: ClothingCategory;
  search?: string;
  showArchived?: boolean;
}

export function filterClothingItems(
  items: ClothingItem[],
  filters: ClothingItemsFilter,
): ClothingItem[] {
  const search = filters.search?.trim().toLowerCase();

  return items.filter((item) => {
    if (!filters.showArchived && item.archived_at) {
      return false;
    }

    if (filters.category && item.category !== filters.category) {
      return false;
    }

    if (search && !item.name.toLowerCase().includes(search)) {
      return false;
    }

    return true;
  });
}

export function countActiveClothingItems(items: ClothingItem[]): number {
  return items.filter((item) => !item.archived_at).length;
}

export function countArchivedClothingItems(items: ClothingItem[]): number {
  return items.filter((item) => item.archived_at).length;
}
