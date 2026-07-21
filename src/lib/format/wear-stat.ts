import { getTodayISO, parseDateISO } from "@/lib/utils/date";

export function formatLastWorn(lastWornDate: string | null): string {
  if (!lastWornDate) {
    return "Never worn";
  }

  const worn = parseDateISO(lastWornDate);
  const today = parseDateISO(getTodayISO());
  const diffMs = today.getTime() - worn.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Last worn today";
  }
  if (diffDays === 1) {
    return "Last worn yesterday";
  }
  if (diffDays < 7) {
    return `Last worn ${diffDays} days ago`;
  }

  return `Last worn ${worn.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

export function formatWearCount(count: number): string {
  return count === 1 ? "1 wear" : `${count} wears`;
}

export function formatWearsThisMonth(count: number): string {
  if (count === 0) {
    return "None this month";
  }
  return count === 1 ? "1 wear this month" : `${count} wears this month`;
}

export function formatWearsInMonth(count: number, monthLabel: string): string {
  if (count === 0) {
    return `None in ${monthLabel}`;
  }
  return count === 1 ? `1 wear in ${monthLabel}` : `${count} wears in ${monthLabel}`;
}
