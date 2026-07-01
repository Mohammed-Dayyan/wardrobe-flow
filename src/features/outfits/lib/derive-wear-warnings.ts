export type WearWarningType =
  | "worn_yesterday"
  | "worn_two_days_ago"
  | "worn_three_times_week";

export interface WearWarning {
  type: WearWarningType;
  label: string;
}

export function deriveWearWarnings(
  lastWorn: string | null | undefined,
  weekWears: number,
  todayISO: string,
): WearWarning[] {
  const warnings: WearWarning[] = [];

  if (lastWorn) {
    const yesterday = addDays(todayISO, -1);
    const twoDaysAgo = addDays(todayISO, -2);

    if (lastWorn === yesterday) {
      warnings.push({ type: "worn_yesterday", label: "Worn yesterday" });
    } else if (lastWorn === twoDaysAgo) {
      warnings.push({ type: "worn_two_days_ago", label: "Worn 2 days ago" });
    }
  }

  if (weekWears >= 3) {
    warnings.push({
      type: "worn_three_times_week",
      label: "Worn 3 times this week",
    });
  }

  return warnings;
}

function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
