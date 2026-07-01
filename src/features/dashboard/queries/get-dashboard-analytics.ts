import type { AnalyticsSnapshot } from "@/features/analytics/types/analytics-snapshot";
import { getAnalyticsSnapshot } from "@/features/analytics/queries/get-analytics-snapshot";

const DASHBOARD_ANALYTICS_LIMIT = 3;

export async function getDashboardAnalytics(
  month: string,
  wardrobeCount: number,
): Promise<AnalyticsSnapshot | null> {
  if (wardrobeCount === 0) {
    return null;
  }

  try {
    return await getAnalyticsSnapshot(month, DASHBOARD_ANALYTICS_LIMIT);
  } catch (error) {
    console.error("getDashboardAnalytics:", error);
    return null;
  }
}
