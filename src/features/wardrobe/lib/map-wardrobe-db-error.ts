import { mapSupabaseError } from "@/lib/errors/map-supabase-error";
import { WARDROBE_ERRORS } from "@/features/wardrobe/types/action-result";

export function mapWardrobeDbError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("referenced") || normalized.includes("foreign key")) {
    return WARDROBE_ERRORS.REFERENCED;
  }

  return mapSupabaseError(message, WARDROBE_ERRORS.SAVE_FAILED);
}
