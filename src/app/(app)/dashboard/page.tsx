import { getDashboardAnalytics } from "@/features/dashboard/queries/get-dashboard-analytics";
import { DashboardView } from "@/features/dashboard/components/DashboardView";
import { getDashboardStats } from "@/features/dashboard/queries/get-dashboard-stats";
import { getRecentActivity } from "@/features/dashboard/queries/get-recent-activity";
import { getTodayOutfits } from "@/features/dashboard/queries/get-today-outfit";
import { getWeekOutfits } from "@/features/dashboard/queries/get-week-outfits";
import { getProfile } from "@/features/profile/queries/get-profile";
import { getWardrobeSummary } from "@/features/wardrobe/queries/get-wardrobe-summary";
import { getUserCurrentMonthParam } from "@/lib/timezone/get-user-calendar";

// ISR cache; mutations revalidate affected paths via server actions.
export const revalidate = 60;

export default async function DashboardPage() {
  const month = await getUserCurrentMonthParam();

  const [
    profile,
    todayOutfits,
    recentActivity,
    wardrobeSummary,
    weekOutfits,
    dashboardStats,
  ] = await Promise.all([
    getProfile(),
    getTodayOutfits(),
    getRecentActivity(),
    getWardrobeSummary(),
    getWeekOutfits(),
    getDashboardStats(),
  ]);

  const analytics = await getDashboardAnalytics(month, wardrobeSummary.total);

  return (
    <DashboardView
      todayOutfits={todayOutfits}
      recentActivity={recentActivity}
      wardrobeSummary={wardrobeSummary}
      weekOutfits={weekOutfits}
      dashboardStats={dashboardStats}
      analytics={analytics}
      profile={profile}
    />
  );
}
