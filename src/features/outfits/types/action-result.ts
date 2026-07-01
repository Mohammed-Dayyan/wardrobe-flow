import { AUTH_ERRORS } from "@/lib/auth-errors";

export type OutfitActionResult =
  | { success: true }
  | { success: false; error: string };

export const OUTFIT_ERRORS = {
  UNAUTHORIZED: AUTH_ERRORS.UNAUTHORIZED,
  NOT_FOUND: "Outfit not found.",
  SAVE_FAILED: "Could not save outfit. Please try again.",
  DUPLICATE: "You already logged this exact outfit for this day.",
  MAX_PER_DAY: "You can log up to 5 outfits per day.",
  FUTURE_DATE: "Future dates cannot be logged.",
  DATE_MISMATCH: "The outfit date does not match this page.",
  INVALID_SELECTION: "One or more clothing selections are invalid for this outfit.",
} as const;
