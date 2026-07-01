export const CLOTHING_CATEGORIES = ["top", "pants", "jacket", "shoes"] as const;

export type ClothingCategory = (typeof CLOTHING_CATEGORIES)[number];

export const CLOTHING_CATEGORY_LABELS: Record<ClothingCategory, string> = {
  top: "Top",
  pants: "Pants",
  jacket: "Jacket",
  shoes: "Shoes",
};
