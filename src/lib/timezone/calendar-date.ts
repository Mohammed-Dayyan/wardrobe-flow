import { isValidTimezone } from "@/lib/timezone/is-valid-timezone";

function readCalendarParts(timeZone: string, reference: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(reference);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to resolve calendar date for timezone: ${timeZone}`);
  }

  return { year, month, day };
}

/** Calendar date (YYYY-MM-DD) for an IANA timezone, independent of server locale. */
export function getCalendarDateISO(
  timeZone: string,
  reference: Date = new Date(),
): string {
  if (!isValidTimezone(timeZone)) {
    throw new Error(`Invalid timezone: ${timeZone}`);
  }

  const { year, month, day } = readCalendarParts(timeZone, reference);
  return `${year}-${month}-${day}`;
}

/** Month param (YYYY-MM) for an IANA timezone. */
export function getCalendarMonthParam(
  timeZone: string,
  reference: Date = new Date(),
): string {
  if (!isValidTimezone(timeZone)) {
    throw new Error(`Invalid timezone: ${timeZone}`);
  }

  const { year, month } = readCalendarParts(timeZone, reference);
  return `${year}-${month}`;
}
