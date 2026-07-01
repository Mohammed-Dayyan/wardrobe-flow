import { createClient } from "@/lib/supabase/server";
import { mapAnalyticsSnapshot } from "@/features/analytics/lib/map-wear-stat";
import type { AnalyticsSnapshot } from "@/features/analytics/types/analytics-snapshot";

// Default limit is for the analytics page; dashboard passes a smaller limit via getDashboardAnalytics.
export async function getAnalyticsSnapshot(
  month: string,
  limit = 10,
): Promise<AnalyticsSnapshot> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_analytics_snapshot", {
    p_month: month,
    p_limit: limit,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || typeof data !== "object") {
    throw new Error("Analytics snapshot returned no data");
  }

  return mapAnalyticsSnapshot(data as Parameters<typeof mapAnalyticsSnapshot>[0]);
}
