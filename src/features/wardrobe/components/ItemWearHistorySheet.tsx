"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Plus } from "lucide-react";
import { formatLastWorn, formatWearCount } from "@/lib/format/wear-stat";
import { CLOTHING_CATEGORY_LABELS } from "@/lib/validations/categories";
import { ITEM_WEAR_HISTORY_PAGE_SIZE } from "@/features/wardrobe/constants/wear-history";
import { ItemWearHistoryList } from "@/features/wardrobe/components/ItemWearHistoryList";
import type { ItemWearHistory } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ItemWearHistorySheetProps {
  history: ItemWearHistory;
}

export function ItemWearHistorySheet({ history }: ItemWearHistorySheetProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { item, entries, wear_count, last_worn_date, has_more } = history;
  const isArchived = Boolean(item.archived_at);
  const categoryLabel = CLOTHING_CATEGORY_LABELS[item.category] ?? item.category;

  const closeSheet = () => {
    startTransition(() => {
      router.replace("/wardrobe");
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && closeSheet()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 pr-6">
            <span className="min-w-0">{item.name}</span>
            {isArchived ? (
              <Badge
                variant="secondary"
                className="h-5 shrink-0 px-1.5 text-[10px] uppercase tracking-wide"
              >
                Archived
              </Badge>
            ) : null}
          </DialogTitle>
          <DialogDescription>
            {formatWearCount(wear_count)}
            <span aria-hidden> · </span>
            {formatLastWorn(last_worn_date)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{categoryLabel}</span>
          <span aria-hidden>·</span>
          <span
            className="inline-flex size-2.5 shrink-0 rounded-full border border-border/70"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span className="capitalize">{item.color}</span>
        </div>

        {entries.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Not worn yet. Log an outfit that includes this piece to start tracking.
            </p>
            <Button
              size="sm"
              className="w-full"
              nativeButton={false}
              render={<Link href="/outfits/new" />}
            >
              <Plus className="size-4" />
              Log an outfit
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <ItemWearHistoryList entries={entries} />
            {has_more ? (
              <p className="text-center text-xs text-muted-foreground">
                Showing latest {ITEM_WEAR_HISTORY_PAGE_SIZE} wears
              </p>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link href={`/wardrobe/${item.id}/edit`} />}
            disabled={isPending}
          >
            Edit item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
