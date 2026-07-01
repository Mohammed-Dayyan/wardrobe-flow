import Link from "next/link";
import type { ItemWearStat } from "@/types/database";
import { CLOTHING_CATEGORY_LABELS } from "@/lib/validations/categories";
import {
  formatLastWorn,
  formatWearCount,
  formatWearsInMonth,
} from "@/features/analytics/lib/format-wear-stat";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WearStatRowProps {
  item: ItemWearStat;
  rank?: number;
  monthLabel?: string;
}

function WearStatRow({ item, rank, monthLabel }: WearStatRowProps) {
  const monthWearText = monthLabel
    ? formatWearsInMonth(item.wears_this_month, monthLabel)
    : null;

  return (
    <li>
      <Link
        href={`/wardrobe/${item.id}/edit`}
        className="flex items-start gap-3 rounded-lg border border-border/80 p-3 transition-colors hover:bg-muted/50"
      >
        {rank !== undefined ? (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
            {rank}
          </span>
        ) : null}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-snug">{item.name}</p>
            <Badge variant="outline" className="shrink-0 capitalize">
              {CLOTHING_CATEGORY_LABELS[item.category]}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
            <span
              className="size-3 shrink-0 rounded-full border border-border/80"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span className="capitalize">{item.color}</span>
            <span aria-hidden>·</span>
            <span>{formatWearCount(item.wear_count)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatLastWorn(item.last_worn_date)}
            {monthWearText ? ` · ${monthWearText}` : null}
          </p>
        </div>
      </Link>
    </li>
  );
}

interface TopItemsListProps {
  items: ItemWearStat[];
  dayTypeLabel?: string;
  monthLabel?: string;
  emptyMessage?: string;
}

export function TopItemsList({
  items,
  dayTypeLabel,
  monthLabel,
  emptyMessage,
}: TopItemsListProps) {
  const title = dayTypeLabel ? `Most worn (${dayTypeLabel})` : "Most worn";

  return (
    <Card className={cn("border-border/60 shadow-sm")}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {emptyMessage ?? "No wear data yet for this filter."}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <WearStatRow
                key={item.id}
                item={item}
                rank={index + 1}
                monthLabel={monthLabel}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

interface LeastWornListProps {
  items: ItemWearStat[];
  monthLabel?: string;
  emptyMessage?: string;
}

export function LeastWornList({
  items,
  monthLabel,
  emptyMessage,
}: LeastWornListProps) {
  return (
    <Card className={cn("border-border/60 shadow-sm")}>
      <CardHeader>
        <CardTitle className="text-base">Least worn</CardTitle>
        {monthLabel ? (
          <CardDescription>
            Items you wore least (or not at all) in {monthLabel}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {emptyMessage ?? "No wear data yet for this filter."}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <WearStatRow key={item.id} item={item} monthLabel={monthLabel} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
