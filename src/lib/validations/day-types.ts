import type { DayType } from "@/types/database";

export const DAY_TYPES = [
  "office",
  "stay_home",
  "travel",
  "day_out",
] as const satisfies readonly DayType[];

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  office: "Office",
  stay_home: "Stay home",
  travel: "Travel",
  day_out: "Day out",
};

export const DAY_TYPE_CONFIG: Record<
  DayType,
  { label: string; badgeClass: string; dotClass: string; borderClass: string }
> = {
  office: {
    label: "Office",
    badgeClass: "bg-indigo-100 text-indigo-700",
    dotClass: "bg-indigo-500",
    borderClass: "border-indigo-400",
  },
  stay_home: {
    label: "Stay home",
    badgeClass: "bg-emerald-100 text-emerald-700",
    dotClass: "bg-emerald-500",
    borderClass: "border-emerald-400",
  },
  travel: {
    label: "Travel",
    badgeClass: "bg-sky-100 text-sky-700",
    dotClass: "bg-sky-500",
    borderClass: "border-sky-400",
  },
  day_out: {
    label: "Day out",
    badgeClass: "bg-rose-100 text-rose-700",
    dotClass: "bg-rose-500",
    borderClass: "border-rose-400",
  },
};

export function requiresOfficeOutfit(dayType: DayType): boolean {
  return dayType === "office";
}

/** @deprecated Use requiresOfficeOutfit */
export function isOfficeDay(dayType: DayType): boolean {
  return requiresOfficeOutfit(dayType);
}

/** @deprecated No longer used; outfit picker is always visible */
export function isOutfitPickerOpenByDefault(dayType: DayType): boolean {
  return dayType === "office" || dayType === "day_out";
}

export function getDayTypeLabel(dayType: DayType | string): string {
  const config = DAY_TYPE_CONFIG[dayType as DayType];
  if (config) {
    return config.label;
  }

  return String(dayType)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getOutfitSectionCopy(dayType: DayType): {
  title: string;
  description?: string;
  isOptional: boolean;
} {
  if (dayType === "office") {
    return {
      title: "Office outfit",
      description: "Pick what you wore. Shoes are optional.",
      isOptional: false,
    };
  }

  return {
    title: "Outfit",
    isOptional: true,
  };
}
