import type { AnalyticsSnapshot } from "@/features/analytics/types/analytics-snapshot";
import { DashboardHero } from "@/features/dashboard/components/DashboardHero";
import { DashboardStats } from "@/features/dashboard/components/DashboardStats";
import { DashboardWelcome } from "@/features/dashboard/components/DashboardWelcome";
import { InsightsTeaser } from "@/features/dashboard/components/InsightsTeaser";
import { RecentActivitySection } from "@/features/dashboard/components/RecentActivitySection";
import { WeekStrip } from "@/features/dashboard/components/WeekStrip";
import { MAX_OUTFITS_PER_DAY } from "@/features/outfits/constants/outfit-limits";
import type { DashboardStats as DashboardStatsData } from "@/features/dashboard/queries/get-dashboard-stats";
import type { RecentActivityItem } from "@/features/dashboard/queries/get-recent-activity";
import type { WeekOutfitDay } from "@/features/dashboard/queries/get-week-outfits";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";
import type { Profile } from "@/types/database";
import type { WardrobeSummary } from "@/features/wardrobe/queries/get-wardrobe-summary";

interface DashboardViewProps {
  todayOutfits: OutfitWithItems[];
  recentActivity: RecentActivityItem[];
  wardrobeSummary: WardrobeSummary;
  weekOutfits: WeekOutfitDay[];
  dashboardStats: DashboardStatsData;
  analytics: AnalyticsSnapshot | null;
  profile: Profile | null;
}

export function DashboardView({
  todayOutfits,
  recentActivity,
  wardrobeSummary,
  weekOutfits,
  dashboardStats,
  analytics,
  profile,
}: DashboardViewProps) {
  const isNewUser = wardrobeSummary.total === 0;
  const canAddOutfit = todayOutfits.length < MAX_OUTFITS_PER_DAY;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="sr-only">Dashboard</h1>
        <p className="sr-only">Your daily wardrobe overview</p>
      </div>

      {isNewUser ? <DashboardWelcome /> : null}

      <DashboardHero
        outfits={todayOutfits}
        profile={profile}
        canAddOutfit={canAddOutfit}
      />

      {!isNewUser ? (
        <>
          <WeekStrip days={weekOutfits} />
          <DashboardStats wardrobeSummary={wardrobeSummary} stats={dashboardStats} />
        </>
      ) : null}

      <RecentActivitySection items={recentActivity} />

      {!isNewUser && analytics?.hasOutfitLogs ? (
        <InsightsTeaser snapshot={analytics} />
      ) : null}
    </div>
  );
}
