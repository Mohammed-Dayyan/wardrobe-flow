import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatFriendlyDateWithYear } from "@/lib/utils/date";
import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import type { HistoryTimelineItem } from "@/features/history/queries/get-history-timeline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HistoryTimelineCardProps {
  item: HistoryTimelineItem;
}

export function HistoryTimelineCard({ item }: HistoryTimelineCardProps) {
  const config = DAY_TYPE_CONFIG[item.day_type];

  return (
    <Link
      href={`/history?view=timeline&date=${item.date}`}
      className="group block"
    >
      <Card
        className={cn(
          "overflow-hidden border-border/60 shadow-sm transition-colors",
          "hover:border-border hover:bg-muted/30",
        )}
      >
        <CardContent className="flex gap-0 p-0">
          <span
            className={cn("w-1 shrink-0", config.dotClass)}
            aria-hidden
          />
          <div className="min-w-0 flex-1 p-4 pr-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="font-medium leading-snug">
                  {formatFriendlyDateWithYear(item.date)}
                </p>
                {item.summary ? (
                  <p className="text-sm text-muted-foreground">{item.summary}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No items logged
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge className={config.badgeClass}>{config.label}</Badge>
                <ChevronRight
                  className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                  aria-hidden
                />
              </div>
            </div>
            {item.notes ? (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {item.notes}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
