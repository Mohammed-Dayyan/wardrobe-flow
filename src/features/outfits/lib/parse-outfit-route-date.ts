import { isDateISO } from "@/lib/utils/date";

export function parseOutfitRouteDate(param: string, today: string): string | null {
  if (!isDateISO(param) || param > today) {
    return null;
  }

  return param;
}
