import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatFriendlyDateWithYear } from "@/lib/utils/date";
import { DAY_TYPE_CONFIG, getDayTypeLabel } from "@/lib/validations/day-types";
import type { ItemWearHistoryEntry } from "@/types/database";
import { Badge } from "@/components/ui/badge";

interface ItemWearHistoryListProps {
  entries: ItemWearHistoryEntry[];
}

export function ItemWearHistoryList({ entries }: ItemWearHistoryListProps) {
  return (
    <ul className="space-y-2">
      {entries.map((entry) => {
        const config = DAY_TYPE_CONFIG[entry.day_type];

        return (
          <li key={entry.id}>
            <Link
              href={`/outfits/${entry.worn_date}`}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-sm font-medium leading-snug">
                  {formatFriendlyDateWithYear(entry.worn_date)}
                </p>
                <Badge className={config.badgeClass}>
                  {config.label ?? getDayTypeLabel(entry.day_type)}
                </Badge>
              </div>
              <ChevronRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
