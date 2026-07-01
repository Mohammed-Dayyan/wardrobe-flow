import type { ItemWearStat } from "@/types/database";
import { getFilteredLeastWornEmptyMessage } from "@/features/analytics/lib/wear-insights-context";

export function findWearListOverlap(
  mostWorn: ItemWearStat[],
  leastWorn: ItemWearStat[],
): string[] {
  const mostIds = new Set(mostWorn.map((item) => item.id));
  return leastWorn.filter((item) => mostIds.has(item.id)).map((item) => item.id);
}

interface ResolveLeastWornEmptyMessageInput {
  dayTypeLabel?: string;
  monthLabel: string;
  mostWornCount: number;
  leastWornCount: number;
}

export function resolveLeastWornEmptyMessage({
  dayTypeLabel,
  monthLabel,
  mostWornCount,
  leastWornCount,
}: ResolveLeastWornEmptyMessageInput): string {
  if (leastWornCount > 0) {
    return getFilteredLeastWornEmptyMessage(dayTypeLabel, monthLabel);
  }

  if (mostWornCount > 0) {
    if (dayTypeLabel) {
      return `No other items for ${dayTypeLabel.toLowerCase()} days in ${monthLabel} - your most-worn list covers them all.`;
    }
    return `No other items to show - everything you wore in ${monthLabel} is already listed above.`;
  }

  return getFilteredLeastWornEmptyMessage(dayTypeLabel, monthLabel);
}
