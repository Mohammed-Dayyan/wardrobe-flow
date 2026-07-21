import Link from "next/link";
import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import type { AnalyticsSnapshot } from "@/features/analytics/types/analytics-snapshot";
import { formatWearCount } from "@/lib/format/wear-stat";
import { getInsightsTeaserWearHint } from "@/features/analytics/lib/wear-insights-context";
import { formatMonthLabel, getCurrentMonthParam } from "@/lib/utils/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InsightsTeaserProps {
  snapshot: AnalyticsSnapshot;
}

export function InsightsTeaser({ snapshot }: InsightsTeaserProps) {
  const month = getCurrentMonthParam();
  const monthLabel = formatMonthLabel(month);
  const breakdown = snapshot.breakdown.filter((row) => row.count > 0);
  const total = breakdown.reduce((sum, row) => sum + row.count, 0);
  const topWorn = snapshot.mostWorn.all.slice(0, 3);
  const wearHint = getInsightsTeaserWearHint(snapshot, monthLabel);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">This month</h2>
        <Link href="/analytics" className="text-sm font-medium text-primary hover:underline">
          See all analytics
        </Link>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {monthLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {total === 0 ? (
            <p className="text-sm text-muted-foreground">No outfits logged this month yet.</p>
          ) : (
            <ul className="space-y-3">
              {breakdown.map((row) => {
                const config = DAY_TYPE_CONFIG[row.day_type];
                const share = (row.count / total) * 100;

                return (
                  <li key={row.day_type} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn("size-2.5 shrink-0 rounded-full", config.dotClass)}
                          aria-hidden
                        />
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <span className="tabular-nums text-muted-foreground">
                        {row.count} {row.count === 1 ? "log" : "logs"}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", config.dotClass)}
                        style={{ width: `${share}%` }}
                        role="presentation"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {snapshot.hasWearInMonth && topWorn.length > 0 ? (
            <div className="space-y-2 border-t border-border/60 pt-4">
              <p className="text-sm font-medium">Most worn</p>
              <ul className="space-y-2">
                {topWorn.map((item, index) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                        {index + 1}
                      </span>
                      <span
                        className="size-3 shrink-0 rounded-full border border-border/80"
                        style={{ backgroundColor: item.color }}
                        aria-hidden
                      />
                      <span className="truncate font-medium">{item.name}</span>
                    </div>
                    <span className="shrink-0 text-muted-foreground">
                      {formatWearCount(item.wear_count)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : wearHint ? (
            <p className="border-t border-border/60 pt-4 text-sm text-muted-foreground">
              {wearHint}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
