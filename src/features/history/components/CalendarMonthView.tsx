"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  canGoToNextMonth,
  formatMonthLabel,
  getCalendarWeeks,
  getTodayISO,
  parseDateISO,
  shiftMonth,
} from "@/lib/utils/date";
import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import type { HistoryMonthDay } from "@/features/history/queries/get-history-month";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarMonthViewProps {
  month: string;
  currentMonth: string;
  days: HistoryMonthDay[];
}

export function CalendarMonthView({
  month,
  currentMonth,
  days,
}: CalendarMonthViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const today = getTodayISO();

  const dayMap = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );
  const weeks = useMemo(() => getCalendarWeeks(month), [month]);

  const navigateMonth = useCallback(
    (delta: number) => {
      if (delta > 0 && !canGoToNextMonth(month, currentMonth)) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("view", "calendar");
      params.set("month", shiftMonth(month, delta));
      params.delete("date");

      startTransition(() => {
        router.push(`/history?${params.toString()}`);
      });
    },
    [month, currentMonth, router, searchParams],
  );

  const openDay = useCallback(
    (date: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", "calendar");
      params.set("month", month);
      params.set("date", date);

      startTransition(() => {
        router.replace(`/history?${params.toString()}`);
      });
    },
    [month, router, searchParams],
  );

  const openEmptyDay = useCallback(
    (date: string) => {
      startTransition(() => {
        router.push(`/outfits/${date}/entry`);
      });
    },
    [router],
  );

  const canGoNext = canGoToNextMonth(month, currentMonth);

  return (
    <div className={cn("space-y-3", isPending && "opacity-70")}>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => navigateMonth(-1)}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <h2 className="text-base font-semibold">{formatMonthLabel(month)}</h2>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => navigateMonth(1)}
          disabled={!canGoNext}
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-[5/4]" />;
          }

          const dayEntry = dayMap.get(date);
          const dayType = dayEntry?.day_type ?? null;
          const config = dayType ? DAY_TYPE_CONFIG[dayType] : null;
          const dayNumber = parseDateISO(date).getDate();
          const isFuture = date > today;
          const isToday = date === today;
          const hasLog = Boolean(dayType);

          const cellClassName = cn(
            "flex aspect-[5/4] w-full items-center justify-center rounded-md border text-base transition-colors",
            isFuture
              ? "cursor-not-allowed border-transparent text-muted-foreground/50 opacity-50"
              : isToday && hasLog && config
                ? cn(
                    "border-2 bg-primary/5 ring-1 ring-primary/20 hover:bg-primary/10",
                    config.borderClass,
                  )
                : isToday
                  ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20 hover:bg-primary/10"
                  : hasLog && config
                    ? cn(
                        "border-2 hover:bg-muted/50",
                        config.borderClass,
                      )
                    : "border-border/60 text-muted-foreground hover:border-primary/30 hover:bg-muted/40",
          );

          if (isFuture) {
            return (
              <div
                key={date}
                className={cellClassName}
                aria-disabled="true"
                title="Future days cannot be logged yet"
              >
                <span className={cn(isToday && "font-semibold")}>{dayNumber}</span>
              </div>
            );
          }

          return (
            <button
              key={date}
              type="button"
              onClick={() => (hasLog ? openDay(date) : openEmptyDay(date))}
              className={cellClassName}
              title={hasLog ? "View outfits" : "Log outfit for this day"}
            >
              <span className={cn(isToday && "font-semibold")}>{dayNumber}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
