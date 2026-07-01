import Link from "next/link";
import { getTodayISO, parseDateISO } from "@/lib/utils/date";
import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import type { WeekOutfitDay } from "@/features/dashboard/queries/get-week-outfits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface WeekStripProps {
  days: WeekOutfitDay[];
}

export function WeekStrip({ days }: WeekStripProps) {
  const today = getTodayISO();
  const loggedCount = days.filter((day) => day.day_type !== null).length;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">This week</CardTitle>
        <span className="text-sm tabular-nums text-muted-foreground">
          {loggedCount}/7 logged
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const weekdayLabel = WEEKDAY_LABELS[index] ?? "";
            const dayNumber = parseDateISO(day.date).getDate();
            const isFuture = day.date > today;
            const visibleDayTypes = day.dayTypes.slice(0, 3);

            const cellClassName = cn(
              "flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2 text-center transition-colors",
              day.isToday
                ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                : "border-border/60",
              isFuture
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-muted/50",
            );

            const cellContent = (
              <>
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {weekdayLabel}
                </span>
                <span className="text-sm font-semibold tabular-nums">{dayNumber}</span>
                {visibleDayTypes.length > 0 ? (
                  <span className="flex items-center gap-0.5">
                    {visibleDayTypes.map((dayType) => {
                      const config = DAY_TYPE_CONFIG[dayType];
                      return (
                        <span
                          key={dayType}
                          className={cn("size-2 rounded-full", config.dotClass)}
                          aria-label={config.label}
                        />
                      );
                    })}
                  </span>
                ) : (
                  <span className="size-2 rounded-full bg-muted" aria-hidden />
                )}
              </>
            );

            if (isFuture) {
              return (
                <div
                  key={day.date}
                  className={cellClassName}
                  aria-disabled="true"
                  title="Future days cannot be logged yet"
                >
                  {cellContent}
                </div>
              );
            }

            return (
              <Link
                key={day.date}
                href={`/outfits/${day.date}`}
                className={cellClassName}
              >
                {cellContent}
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
