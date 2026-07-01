"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { formatFriendlyDate, addDaysISO, getTodayISO } from "@/lib/utils/date";
import { MAX_OUTFITS_PER_DAY } from "@/features/outfits/constants/outfit-limits";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";
import { OutfitLogCard } from "@/features/outfits/components/OutfitLogCard";
import { OutfitDatePicker } from "@/features/outfits/components/OutfitDatePicker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormPanel } from "@/components/layout/FormPanel";

interface DayOutfitsHubProps {
  date: string;
  outfits: OutfitWithItems[];
  outfitCount: number;
  canAddOutfit: boolean;
}

export function DayOutfitsHub({
  date,
  outfits,
  outfitCount,
  canAddOutfit,
}: DayOutfitsHubProps) {
  const router = useRouter();
  const today = getTodayISO();
  const prevDate = addDaysISO(date, -1);
  const nextDate = addDaysISO(date, 1);
  const canGoNext = nextDate <= today;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => router.push(`/outfits/${prevDate}`)}
              aria-label="Previous day"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">
              {formatFriendlyDate(date)}
            </h1>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => router.push(`/outfits/${nextDate}`)}
              disabled={!canGoNext}
              aria-label="Next day"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            {outfitCount}/{MAX_OUTFITS_PER_DAY} outfits
          </Badge>
        </div>
      </div>

      <FormPanel>
        <OutfitDatePicker value={date} />
      </FormPanel>

      {outfits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing logged for this day yet.
          </p>
          {canAddOutfit ? (
            <Button
              className="mt-4"
              nativeButton={false}
              render={<Link href={`/outfits/${date}/entry`} />}
            >
              <Plus className="size-4" />
              Add outfit
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {outfits.map((outfit, index) => (
            <OutfitLogCard
              key={outfit.id}
              outfit={outfit}
              index={index}
              date={date}
            />
          ))}
        </div>
      )}

      {outfits.length > 0 ? (
        canAddOutfit ? (
          <Button
            className="h-11 w-full"
            nativeButton={false}
            render={<Link href={`/outfits/${date}/entry`} />}
          >
            <Plus className="size-4" />
            Add outfit ({outfitCount}/{MAX_OUTFITS_PER_DAY})
          </Button>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Maximum {MAX_OUTFITS_PER_DAY} outfits per day reached.
          </p>
        )
      ) : null}
    </div>
  );
}
