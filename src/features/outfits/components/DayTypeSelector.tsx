"use client";

import { DAY_TYPES, DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import type { DayType } from "@/types/database";
import { cn } from "@/lib/utils";

interface DayTypeSelectorProps {
  value: DayType;
  onChange: (value: DayType) => void;
}

export function DayTypeSelector({ value, onChange }: DayTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {DAY_TYPES.map((dayType) => {
        const config = DAY_TYPE_CONFIG[dayType];
        const selected = value === dayType;

        return (
          <button
            key={dayType}
            type="button"
            onClick={() => onChange(dayType)}
            className={cn(
              "rounded-xl border px-3 py-3 text-left text-sm font-medium transition-all",
              selected
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border/80 bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/40 hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2 rounded-full",
                  selected ? "bg-primary-foreground/80" : config.dotClass,
                )}
                aria-hidden
              />
              {config.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
