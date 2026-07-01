"use client";

import { useRef, useCallback, useTransition } from "react";
import { Calendar } from "lucide-react";
import { formatPickerDate, getTodayISO } from "@/lib/utils/date";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface OutfitDatePickerProps {
  value: string;
}

export function OutfitDatePicker({ value }: OutfitDatePickerProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const today = getTodayISO();

  const handleChange = useCallback(
    (nextDate: string) => {
      if (!nextDate || nextDate > today) {
        return;
      }

      startTransition(() => {
        router.push(`/outfits/${nextDate}`);
      });
    },
    [router, today],
  );

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  return (
    <div className={cn("space-y-2", isPending && "opacity-70")}>
      <Label htmlFor="outfit-date">Date</Label>
      <div className="relative">
        <button
          type="button"
          onClick={openPicker}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm transition-colors",
            "hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          )}
        >
          <span className="tabular-nums">{formatPickerDate(value)}</span>
          <Calendar className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
        <input
          ref={inputRef}
          id="outfit-date"
          type="date"
          max={today}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          className="pointer-events-none absolute inset-0 opacity-0"
          tabIndex={-1}
          aria-hidden
        />
      </div>
    </div>
  );
}
