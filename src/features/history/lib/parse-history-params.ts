import { clampDateToToday, parseMonthParam } from "@/lib/utils/date";

export type HistoryViewMode = "timeline" | "calendar";

export interface ParsedHistoryParams {
  view: HistoryViewMode;
  page: number;
  month: string;
  detailDate: string | null;
}

interface HistorySearchParams {
  view?: string;
  page?: string;
  month?: string;
  date?: string;
}

export function parseHistoryParams(
  params: HistorySearchParams,
  today: string,
  currentMonth: string,
): ParsedHistoryParams {
  const view: HistoryViewMode =
    params.view === "calendar" ? "calendar" : "timeline";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const month = parseMonthParam(params.month, currentMonth, currentMonth);
  const detailDate = params.date ? clampDateToToday(params.date, today) : null;

  return { view, page, month, detailDate };
}
