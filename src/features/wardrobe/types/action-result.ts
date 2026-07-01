import { AUTH_ERRORS } from "@/lib/auth-errors";

export type WardrobeActionResult =
  | { success: true; itemId?: string }
  | { success: false; error: string };

export const WARDROBE_ERRORS = {
  UNAUTHORIZED: AUTH_ERRORS.UNAUTHORIZED,
  REFERENCED: "This item appears in outfit history and cannot be deleted.",
  CATEGORY_LOCKED:
    "Category cannot be changed while this item is used in outfits.",
  NOT_FOUND: "Clothing item not found.",
  SAVE_FAILED: "Could not save this item. Please try again.",
  ARCHIVE_FAILED: "Could not archive this item. Please try again.",
  ALREADY_ARCHIVED: "This item is already archived.",
  NOT_ARCHIVED: "This item is not archived.",
} as const;
