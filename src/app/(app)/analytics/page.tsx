import Link from "next/link";
import { parseMonthParam } from "@/lib/utils/date";
import { getAnalyticsSnapshot } from "@/features/analytics/queries/get-analytics-snapshot";
import { AnalyticsView } from "@/features/analytics/components/AnalyticsView";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { getUserCurrentMonthParam } from "@/lib/timezone/get-user-calendar";

// ISR cache; mutations revalidate affected paths via server actions.
export const revalidate = 60;

interface AnalyticsPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const currentMonth = await getUserCurrentMonthParam();
  const month = parseMonthParam(params.month, currentMonth, currentMonth);

  const snapshot = await getAnalyticsSnapshot(month);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Insights into your wardrobe usage
        </p>
      </div>

      {snapshot.wardrobeCount === 0 ? (
        <EmptyState
          title="No clothing items yet"
          description="Add items to your wardrobe to start tracking what you wear."
          action={
            <Button nativeButton={false} render={<Link href="/wardrobe/new" />}>
              Add clothing
            </Button>
          }
        />
      ) : (
        <AnalyticsView
          snapshot={snapshot}
          month={month}
          currentMonth={currentMonth}
        />
      )}
    </div>
  );
}
