"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Plus } from "lucide-react";
import { formatFriendlyDateWithYear, getTodayISO } from "@/lib/utils/date";
import { DAY_TYPE_CONFIG, getDayTypeLabel } from "@/lib/validations/day-types";
import { CLOTHING_CATEGORY_LABELS } from "@/lib/validations/categories";
import { MAX_OUTFITS_PER_DAY } from "@/features/outfits/constants/outfit-limits";
import { hasOutfitItems } from "@/features/outfits/lib/format-outfit-summary";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DayDetailSheetProps {
  date: string;
  outfits: OutfitWithItems[];
  outfitCount: number;
  view: "timeline" | "calendar";
  month?: string;
}

export function DayDetailSheet({
  date,
  outfits,
  outfitCount,
  view,
  month,
}: DayDetailSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const today = getTodayISO();
  const canAddOutfit = outfitCount < MAX_OUTFITS_PER_DAY && date <= today;

  const closeSheet = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("date");
    if (view === "calendar" && month) {
      params.set("view", "calendar");
      params.set("month", month);
    } else {
      params.set("view", "timeline");
    }

    startTransition(() => {
      router.replace(params.toString() ? `/history?${params.toString()}` : "/history");
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && closeSheet()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{formatFriendlyDateWithYear(date)}</DialogTitle>
          <DialogDescription>
            {outfitCount === 0
              ? "No entries for this day"
              : `${outfitCount} of ${MAX_OUTFITS_PER_DAY} outfits logged`}
          </DialogDescription>
        </DialogHeader>

        {outfits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing was logged on this date.</p>
        ) : (
          <ul className="space-y-4">
            {outfits.map((outfit, index) => {
              const config = DAY_TYPE_CONFIG[outfit.day_type];

              return (
                <li
                  key={outfit.id}
                  className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Outfit {index + 1}
                    </span>
                    <Badge className={config.badgeClass}>
                      {config.label ?? getDayTypeLabel(outfit.day_type)}
                    </Badge>
                  </div>

                  {hasOutfitItems(outfit.outfit_items) ? (
                    <ul className="space-y-2 text-sm">
                      {outfit.outfit_items.map((item) => (
                        <li key={item.role} className="text-muted-foreground">
                          <span className="text-foreground">
                            {CLOTHING_CATEGORY_LABELS[item.role]}:
                          </span>{" "}
                          {item.clothing_items.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No outfit items logged.</p>
                  )}

                  {outfit.notes ? (
                    <p className="text-sm text-muted-foreground">{outfit.notes}</p>
                  ) : null}

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    nativeButton={false}
                    render={
                      <Link href={`/outfits/${date}/entry/${outfit.id}`} />
                    }
                  >
                    Edit
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {canAddOutfit ? (
            <Button
              size="sm"
              className="w-full"
              nativeButton={false}
              render={<Link href={`/outfits/${date}/entry`} />}
            >
              <Plus className="size-4" />
              Add outfit ({outfitCount}/{MAX_OUTFITS_PER_DAY})
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={<Link href={`/outfits/${date}`} />}
            disabled={isPending}
          >
            View day
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
