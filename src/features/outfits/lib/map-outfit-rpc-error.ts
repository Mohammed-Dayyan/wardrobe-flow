import { OUTFIT_ERRORS } from "@/features/outfits/types/action-result";

export function mapOutfitRpcError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("maximum 5")) {
    return OUTFIT_ERRORS.MAX_PER_DAY;
  }

  if (normalized.includes("duplicate outfit")) {
    return OUTFIT_ERRORS.DUPLICATE;
  }

  if (normalized.includes("future date")) {
    return OUTFIT_ERRORS.FUTURE_DATE;
  }

  if (
    normalized.includes("invalid top") ||
    normalized.includes("invalid pants") ||
    normalized.includes("invalid jacket") ||
    normalized.includes("invalid shoes") ||
    normalized.includes("office days require")
  ) {
    return OUTFIT_ERRORS.INVALID_SELECTION;
  }

  return OUTFIT_ERRORS.SAVE_FAILED;
}
