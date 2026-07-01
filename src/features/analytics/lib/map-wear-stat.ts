import type { ClothingCategory, DayType, ItemWearStat } from "@/types/database";
import type { DayTypeBreakdownRow } from "@/types/database";
import type {
  AnalyticsSnapshot,
  LeastWornByDayType,
  MostWornByDayType,
} from "@/features/analytics/types/analytics-snapshot";
import { findWearListOverlap } from "@/features/analytics/lib/wear-list-context";

interface RpcWearStatRow {
  id: string;
  name: string;
  category: string;
  color: string;
  wear_count: number | string;
  last_worn_date: string | null;
  wears_this_month: number | string;
}

interface RpcBreakdownRow {
  day_type: string;
  count: number | string;
}

interface RpcSnapshot {
  wardrobe_count: number | string;
  has_outfit_logs: boolean;
  has_wear_data: boolean;
  has_wear_in_month: boolean;
  breakdown: RpcBreakdownRow[];
  least_worn: Record<keyof LeastWornByDayType, RpcWearStatRow[]>;
  most_worn: Record<keyof MostWornByDayType, RpcWearStatRow[]>;
}

export function mapWearStatRow(row: RpcWearStatRow): ItemWearStat {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ClothingCategory,
    color: row.color,
    wear_count: Number(row.wear_count),
    last_worn_date: row.last_worn_date,
    wears_this_month: Number(row.wears_this_month),
  };
}

function mapBreakdownRow(row: RpcBreakdownRow): DayTypeBreakdownRow {
  return {
    day_type: row.day_type as DayType,
    count: Number(row.count),
  };
}

function mapWearStatByDayType(
  raw: Record<keyof MostWornByDayType, RpcWearStatRow[]>,
): MostWornByDayType {
  return {
    all: (raw.all ?? []).map(mapWearStatRow),
    office: (raw.office ?? []).map(mapWearStatRow),
    stay_home: (raw.stay_home ?? []).map(mapWearStatRow),
    travel: (raw.travel ?? []).map(mapWearStatRow),
    day_out: (raw.day_out ?? []).map(mapWearStatRow),
  };
}

function assertSnapshotRpcVersion(raw: RpcSnapshot): void {
  if (!("has_wear_in_month" in raw)) {
    throw new Error(
      "Analytics RPC is missing has_wear_in_month. Apply migration 015_analytics_month_scope.sql.",
    );
  }
}

function warnWearListOverlap(snapshot: AnalyticsSnapshot): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const slices = Object.keys(snapshot.mostWorn) as Array<keyof MostWornByDayType>;
  for (const slice of slices) {
    const overlap = findWearListOverlap(snapshot.mostWorn[slice], snapshot.leastWorn[slice]);
    if (overlap.length > 0) {
      console.error(
        `[analytics] most-worn and least-worn overlap on "${slice}" slice:`,
        overlap,
        "Apply migration 016_least_worn_exclude_most_worn.sql.",
      );
    }
  }
}

export function mapAnalyticsSnapshot(raw: RpcSnapshot): AnalyticsSnapshot {
  assertSnapshotRpcVersion(raw);

  const snapshot: AnalyticsSnapshot = {
    wardrobeCount: Number(raw.wardrobe_count),
    hasOutfitLogs: raw.has_outfit_logs,
    hasWearData: raw.has_wear_data,
    hasWearInMonth: Boolean(raw.has_wear_in_month),
    breakdown: (raw.breakdown ?? []).map(mapBreakdownRow),
    leastWorn: mapWearStatByDayType(raw.least_worn ?? {}),
    mostWorn: mapWearStatByDayType(raw.most_worn ?? {}),
  };

  warnWearListOverlap(snapshot);

  return snapshot;
}
