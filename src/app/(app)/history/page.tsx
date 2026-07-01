import { Suspense } from "react";
import { getHistoryTimeline } from "@/features/history/queries/get-history-timeline";
import { getHistoryMonth } from "@/features/history/queries/get-history-month";
import {
  getOutfitDetail,
  getOutfitCountForDate,
} from "@/features/history/queries/get-outfit-detail";
import { parseHistoryParams } from "@/features/history/lib/parse-history-params";
import { HistoryViewTabs } from "@/features/history/components/HistoryView";
import { HistoryContentShell } from "@/features/history/components/HistoryContentShell";
import { HistoryTimeline } from "@/features/history/components/HistoryTimeline";
import { CalendarMonthView } from "@/features/history/components/CalendarMonthView";
import { DayDetailSheet } from "@/features/history/components/DayDetailSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserCalendarContext } from "@/lib/timezone/get-user-calendar";

interface HistoryPageProps {
  searchParams: Promise<{
    view?: string;
    page?: string;
    month?: string;
    date?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;
  const { today, currentMonth } = await getUserCalendarContext();
  const { view, page, month, detailDate } = parseHistoryParams(
    params,
    today,
    currentMonth,
  );

  const [timeline, monthDays, detailOutfits, detailOutfitCount] =
    await Promise.all([
      view === "timeline" ? getHistoryTimeline(page) : Promise.resolve(null),
      view === "calendar" ? getHistoryMonth(month) : Promise.resolve(null),
      detailDate ? getOutfitDetail(detailDate) : Promise.resolve([]),
      detailDate ? getOutfitCountForDate(detailDate) : Promise.resolve(0),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse your past outfits
        </p>
      </div>

      <HistoryContentShell>
        <Suspense fallback={<Skeleton className="h-11 w-full rounded-lg" />}>
          <HistoryViewTabs view={view} />
        </Suspense>

        {view === "timeline" && timeline ? (
          <HistoryTimeline
            items={timeline.items}
            page={timeline.page}
            hasMore={timeline.hasMore}
          />
        ) : null}

        {view === "calendar" && monthDays ? (
          <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
            <CalendarMonthView
              month={month}
              currentMonth={currentMonth}
              days={monthDays}
            />
          </Suspense>
        ) : null}
      </HistoryContentShell>

      {detailDate ? (
        <DayDetailSheet
          date={detailDate}
          outfits={detailOutfits}
          outfitCount={detailOutfitCount}
          view={view}
          month={view === "calendar" ? month : undefined}
        />
      ) : null}
    </div>
  );
}
