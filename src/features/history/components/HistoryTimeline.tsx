"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { HistoryTimelineItem } from "@/features/history/queries/get-history-timeline";
import { buildHistoryHref } from "@/features/history/lib/build-history-href";
import { HistoryTimelineCard } from "@/features/history/components/HistoryTimelineCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/EmptyState";

interface HistoryTimelineProps {
  items: HistoryTimelineItem[];
  page: number;
  hasMore: boolean;
}

export function HistoryTimeline({ items, page, hasMore }: HistoryTimelineProps) {
  const searchParams = useSearchParams();
  const detailDate = searchParams.get("date") ?? undefined;

  if (items.length === 0) {
    return (
      <EmptyState
        title="No history yet"
        description="Your timeline will appear here once you start logging outfits."
      />
    );
  }

  const loadMoreHref = buildHistoryHref({
    view: "timeline",
    page: page + 1,
    date: detailDate,
  });

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <HistoryTimelineCard item={item} />
          </li>
        ))}
      </ul>

      {hasMore ? (
        <div className="flex justify-center pt-1">
          <Button
            variant="outline"
            className="h-10 min-w-32"
            nativeButton={false}
            render={<Link href={loadMoreHref} />}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
