import type { DayType, DayTypeBreakdownRow, ItemWearStat } from "@/types/database";

export type AnalyticsDayTypeFilter = DayType | "all";

export interface MostWornByDayType {
  all: ItemWearStat[];
  office: ItemWearStat[];
  stay_home: ItemWearStat[];
  travel: ItemWearStat[];
  day_out: ItemWearStat[];
}

export type LeastWornByDayType = MostWornByDayType;

export interface AnalyticsSnapshot {
  wardrobeCount: number;
  hasOutfitLogs: boolean;
  hasWearData: boolean;
  hasWearInMonth: boolean;
  breakdown: DayTypeBreakdownRow[];
  leastWorn: LeastWornByDayType;
  mostWorn: MostWornByDayType;
}

export function selectMostWorn(
  snapshot: AnalyticsSnapshot,
  filter: AnalyticsDayTypeFilter,
): ItemWearStat[] {
  return filter === "all" ? snapshot.mostWorn.all : snapshot.mostWorn[filter];
}

export function selectLeastWorn(
  snapshot: AnalyticsSnapshot,
  filter: AnalyticsDayTypeFilter,
): ItemWearStat[] {
  return filter === "all" ? snapshot.leastWorn.all : snapshot.leastWorn[filter];
}
