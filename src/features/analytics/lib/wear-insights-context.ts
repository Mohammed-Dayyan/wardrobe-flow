import type { AnalyticsSnapshot } from "@/features/analytics/types/analytics-snapshot";

export type MonthWearEmptyReason =
  | "no_logs_this_month"
  | "logs_without_clothing"
  | "no_wear_this_month_has_history";

export interface WearEmptyMessage {
  title: string;
  description: string;
  showHistoryLink?: boolean;
}

export function getOutfitLogCountInMonth(snapshot: AnalyticsSnapshot): number {
  return snapshot.breakdown.reduce((sum, row) => sum + row.count, 0);
}

export function resolveMonthWearEmptyReason(
  snapshot: AnalyticsSnapshot,
): MonthWearEmptyReason | null {
  if (snapshot.hasWearInMonth) {
    return null;
  }

  const outfitCount = getOutfitLogCountInMonth(snapshot);
  if (outfitCount > 0) {
    return "logs_without_clothing";
  }
  if (snapshot.hasWearData) {
    return "no_wear_this_month_has_history";
  }
  return "no_logs_this_month";
}

export function getMonthWearEmptyMessage(
  reason: MonthWearEmptyReason,
  monthLabel: string,
  outfitLogCount: number,
): WearEmptyMessage {
  switch (reason) {
    case "logs_without_clothing":
      return {
        title: "Wear insights",
        description: `You logged ${outfitLogCount} ${outfitLogCount === 1 ? "day" : "days"} in ${monthLabel}, but no clothing items were tracked. Select items when logging outfits to see most and least worn pieces.`,
        showHistoryLink: true,
      };
    case "no_wear_this_month_has_history":
      return {
        title: "Wear insights",
        description: `No clothing was worn in ${monthLabel}. You have wear history in other months - try navigating to those months.`,
      };
    case "no_logs_this_month":
      return {
        title: "Wear insights",
        description: `No outfits logged in ${monthLabel}. Log outfits with clothing items to build wear insights.`,
      };
  }
}

export function getFilteredMostWornEmptyMessage(
  dayTypeLabel: string | undefined,
  monthLabel: string,
): string {
  if (dayTypeLabel) {
    return `No ${dayTypeLabel.toLowerCase()} wears in ${monthLabel}. Try "All" or log outfits for those days with items selected.`;
  }
  return `No wear data for ${monthLabel}.`;
}

export function getFilteredLeastWornEmptyMessage(
  dayTypeLabel: string | undefined,
  monthLabel: string,
): string {
  if (dayTypeLabel) {
    return `No wardrobe items ranked for ${dayTypeLabel.toLowerCase()} days in ${monthLabel}.`;
  }
  return `No wear data for ${monthLabel}.`;
}

export function getInsightsTeaserWearHint(
  snapshot: AnalyticsSnapshot,
  monthLabel: string,
): string | null {
  const reason = resolveMonthWearEmptyReason(snapshot);
  if (!reason) {
    return null;
  }

  const outfitCount = getOutfitLogCountInMonth(snapshot);
  if (reason === "logs_without_clothing") {
    return `You logged ${outfitCount} ${outfitCount === 1 ? "day" : "days"} in ${monthLabel}, but no clothing was tracked. Add items when logging to see wear insights.`;
  }
  if (reason === "no_wear_this_month_has_history") {
    return `No wears in ${monthLabel}. Check analytics for other months.`;
  }
  return null;
}
