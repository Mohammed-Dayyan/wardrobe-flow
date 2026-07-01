"use client";

import { useState } from "react";
import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import { formatMonthLabel } from "@/lib/utils/date";
import {
  getFilteredMostWornEmptyMessage,
  getMonthWearEmptyMessage,
  getOutfitLogCountInMonth,
  resolveMonthWearEmptyReason,
} from "@/features/analytics/lib/wear-insights-context";
import { resolveLeastWornEmptyMessage } from "@/features/analytics/lib/wear-list-context";
import {
  selectLeastWorn,
  selectMostWorn,
  type AnalyticsDayTypeFilter,
  type AnalyticsSnapshot,
} from "@/features/analytics/types/analytics-snapshot";
import { AnalyticsDayTypeFilterBar } from "@/features/analytics/components/AnalyticsDayTypeFilter";
import { AnalyticsMonthNav } from "@/features/analytics/components/AnalyticsMonthNav";
import { DayTypeBreakdown } from "@/features/analytics/components/DayTypeBreakdown";
import { WearInsightsEmpty } from "@/features/analytics/components/WearInsightsEmpty";
import {
  LeastWornList,
  TopItemsList,
} from "@/features/analytics/components/TopItemsList";

interface AnalyticsViewProps {
  snapshot: AnalyticsSnapshot;
  month: string;
  currentMonth: string;
}

export function AnalyticsView({ snapshot, month, currentMonth }: AnalyticsViewProps) {
  const [dayTypeFilter, setDayTypeFilter] = useState<AnalyticsDayTypeFilter>("all");
  const showBreakdown = dayTypeFilter === "all";
  const monthLabel = formatMonthLabel(month);
  const mostWorn = selectMostWorn(snapshot, dayTypeFilter);
  const leastWorn = selectLeastWorn(snapshot, dayTypeFilter);
  const dayTypeLabel =
    dayTypeFilter === "all" ? undefined : DAY_TYPE_CONFIG[dayTypeFilter].label;
  const monthWearEmptyReason = resolveMonthWearEmptyReason(snapshot);
  const filteredMostWornEmptyMessage = getFilteredMostWornEmptyMessage(
    dayTypeLabel,
    monthLabel,
  );
  const leastWornEmptyMessage = resolveLeastWornEmptyMessage({
    dayTypeLabel,
    monthLabel,
    mostWornCount: mostWorn.length,
    leastWornCount: leastWorn.length,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <AnalyticsMonthNav month={month} currentMonth={currentMonth} />
      </div>

      {snapshot.hasWearInMonth ? (
        <AnalyticsDayTypeFilterBar active={dayTypeFilter} onChange={setDayTypeFilter} />
      ) : null}

      {showBreakdown ? (
        <DayTypeBreakdown month={month} rows={snapshot.breakdown} />
      ) : null}

      {snapshot.hasWearInMonth ? (
        <>
          <TopItemsList
            items={mostWorn}
            dayTypeLabel={dayTypeLabel}
            monthLabel={monthLabel}
            emptyMessage={filteredMostWornEmptyMessage}
          />
          <LeastWornList
            items={leastWorn}
            monthLabel={monthLabel}
            emptyMessage={leastWornEmptyMessage}
          />
        </>
      ) : monthWearEmptyReason ? (
        <WearInsightsEmpty
          message={getMonthWearEmptyMessage(
            monthWearEmptyReason,
            monthLabel,
            getOutfitLogCountInMonth(snapshot),
          )}
        />
      ) : null}
    </div>
  );
}
