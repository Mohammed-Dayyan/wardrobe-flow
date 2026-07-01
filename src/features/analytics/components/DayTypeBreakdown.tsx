import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import type { DayTypeBreakdownRow } from "@/types/database";
import { formatMonthLabel } from "@/lib/utils/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DayTypeBreakdownProps {
  month: string;
  rows: DayTypeBreakdownRow[];
}

export function DayTypeBreakdown({ month, rows }: DayTypeBreakdownProps) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <section>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Day types this month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {total === 0 ? (
            <p className="text-sm text-muted-foreground">
              No outfits logged in {formatMonthLabel(month)}.
            </p>
          ) : (
            <ul className="space-y-3">
              {rows.map((row) => {
                const config = DAY_TYPE_CONFIG[row.day_type];
                const share = total > 0 ? (row.count / total) * 100 : 0;

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
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", config.dotClass)}
                        style={{ width: `${share}%` }}
                        role="presentation"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
