"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { canGoToNextMonth, formatMonthLabel, shiftMonth } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnalyticsMonthNavProps {
  month: string;
  currentMonth: string;
}

export function AnalyticsMonthNav({ month, currentMonth }: AnalyticsMonthNavProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canGoNext = canGoToNextMonth(month, currentMonth);

  const navigateMonth = useCallback(
    (delta: number) => {
      if (delta > 0 && !canGoToNextMonth(month, currentMonth)) {
        return;
      }

      const params = new URLSearchParams();
      const nextMonth = shiftMonth(month, delta);
      params.set("month", nextMonth);

      startTransition(() => {
        router.push(`/analytics?${params.toString()}`);
      });
    },
    [month, currentMonth, router],
  );

  return (
    <div className={cn("flex items-center gap-1", isPending && "opacity-70")}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => navigateMonth(-1)}
        aria-label="Previous month"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[7rem] text-center text-sm font-medium">
        {formatMonthLabel(month)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => navigateMonth(1)}
        disabled={!canGoNext}
        aria-label="Next month"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
