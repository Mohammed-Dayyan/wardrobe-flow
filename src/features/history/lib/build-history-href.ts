import type { HistoryViewMode } from "@/features/history/lib/parse-history-params";

export interface HistoryHrefParams {
  view: HistoryViewMode;
  page?: number;
  month?: string;
  date?: string;
}

export function buildHistoryHref({
  view,
  page,
  month,
  date,
}: HistoryHrefParams): string {
  const params = new URLSearchParams();
  params.set("view", view);

  if (view === "timeline" && page && page > 1) {
    params.set("page", String(page));
  }

  if (view === "calendar" && month) {
    params.set("month", month);
  }

  if (date) {
    params.set("date", date);
  }

  const query = params.toString();
  return query ? `/history?${query}` : "/history";
}
