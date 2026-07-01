// V1 calendar helpers. Client code may use getTodayISO() (browser local).
// Server code should use getUserTodayISO() from @/lib/timezone/get-user-calendar.
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateISO(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayISO(): string {
  return formatDateISO(new Date());
}

const DATE_ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDateISO(value: string): boolean {
  if (!DATE_ISO_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function clampDateToToday(
  isoDate: string,
  today: string = getTodayISO(),
): string | null {
  if (!isDateISO(isoDate) || isoDate > today) {
    return null;
  }

  return isoDate;
}

export function getWeekBounds(reference: Date = new Date()): {
  start: string;
  end: string;
} {
  const day = reference.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(reference);
  monday.setDate(reference.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: formatDateISO(monday), end: formatDateISO(sunday) };
}

export function addDaysISO(isoDate: string, days: number): string {
  const date = parseDateISO(isoDate);
  date.setDate(date.getDate() + days);
  return formatDateISO(date);
}

export function formatDisplayDate(isoDate: string): string {
  const date = parseDateISO(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatFriendlyDate(isoDate: string): string {
  const date = parseDateISO(isoDate);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${day} ${month}`;
}

export function formatFriendlyDateWithYear(isoDate: string): string {
  const date = parseDateISO(isoDate);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${day} ${month} ${date.getFullYear()}`;
}

export function formatPickerDate(isoDate: string): string {
  const date = parseDateISO(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day} / ${month} / ${year}`;
}

export function getCurrentMonthParam(reference: Date = new Date()): string {
  const year = reference.getFullYear();
  const month = String(reference.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function getMonthBounds(monthParam: string): { start: string; end: string } {
  const [year, month] = monthParam.split("-").map(Number);
  const monthStr = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${monthStr}-01`,
    end: `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function shiftMonth(monthParam: string, delta: number): string {
  const [year, month] = monthParam.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return getCurrentMonthParam(date);
}

export function compareMonthParams(a: string, b: string): number {
  return a.localeCompare(b);
}

export function clampMonthParam(month: string, maxMonth: string): string {
  return compareMonthParams(month, maxMonth) > 0 ? maxMonth : month;
}

const MONTH_PARAM_PATTERN = /^\d{4}-\d{2}$/;

export function isMonthParam(value: string): boolean {
  if (!MONTH_PARAM_PATTERN.test(value)) {
    return false;
  }

  const [, month] = value.split("-").map(Number);
  return month >= 1 && month <= 12;
}

export function parseMonthParam(
  raw: string | undefined,
  fallback: string,
  maxMonth: string,
): string {
  if (!raw || !isMonthParam(raw)) {
    return fallback;
  }

  return clampMonthParam(raw, maxMonth);
}

export function canGoToNextMonth(month: string, currentMonth: string): boolean {
  return compareMonthParams(month, currentMonth) < 0;
}

export function formatMonthLabel(monthParam: string): string {
  const [year, month] = monthParam.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function getCalendarWeeks(monthParam: string): (string | null)[][] {
  const [year, month] = monthParam.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= lastDay; day += 1) {
    cells.push(formatDateISO(new Date(year, month - 1, day)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
