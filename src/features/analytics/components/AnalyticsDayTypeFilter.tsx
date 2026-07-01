"use client";

import { DAY_TYPES, DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import type { AnalyticsDayTypeFilter } from "@/features/analytics/types/analytics-snapshot";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS: AnalyticsDayTypeFilter[] = ["all", ...DAY_TYPES];

interface AnalyticsDayTypeFilterProps {
  active: AnalyticsDayTypeFilter;
  onChange: (value: AnalyticsDayTypeFilter) => void;
}

export function AnalyticsDayTypeFilterBar({ active, onChange }: AnalyticsDayTypeFilterProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {FILTER_OPTIONS.map((value) => {
        const label = value === "all" ? "All" : DAY_TYPE_CONFIG[value].label;
        const selected = active === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              "rounded-lg border px-2 py-2 text-center text-sm font-medium transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border/80 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
