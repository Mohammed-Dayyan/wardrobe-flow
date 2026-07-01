"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getTodayISO, formatFriendlyDate } from "@/lib/utils/date";
import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import type { DayType } from "@/types/database";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";
import type { Profile } from "@/types/database";
import { getDisplayName } from "@/features/profile/lib/display-name";
import { getTimeOfDayGreeting } from "@/features/dashboard/lib/greeting";
import { OutfitItemsPreview } from "@/features/outfits/components/OutfitItemsPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const HERO_GRADIENT: Record<DayType, string> = {
  office: "from-indigo-500/15 via-indigo-500/5 to-card",
  stay_home: "from-emerald-500/15 via-emerald-500/5 to-card",
  travel: "from-sky-500/15 via-sky-500/5 to-card",
  day_out: "from-rose-500/15 via-rose-500/5 to-card",
};

interface DashboardHeroProps {
  outfits: OutfitWithItems[];
  profile: Profile | null;
  canAddOutfit: boolean;
}

export function DashboardHero({ outfits, profile, canAddOutfit }: DashboardHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const today = getTodayISO();
  const greeting = getTimeOfDayGreeting();
  const displayName = getDisplayName(profile);
  const safeIndex = outfits.length > 0 ? Math.min(activeIndex, outfits.length - 1) : 0;
  const activeOutfit = outfits[safeIndex] ?? null;
  const config = activeOutfit ? DAY_TYPE_CONFIG[activeOutfit.day_type] : null;
  const hubHref = `/outfits/${today}`;
  const addHref = `/outfits/${today}/entry`;
  const hasMultiple = outfits.length > 1;

  const viewLabel =
    outfits.length === 0
      ? "Log today's outfit"
      : outfits.length === 1
        ? "View today"
        : `View today (${outfits.length} outfits)`;

  const goPrev = () => setActiveIndex((index) => Math.max(0, index - 1));
  const goNext = () =>
    setActiveIndex((index) => Math.min(outfits.length - 1, index + 1));

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 bg-gradient-to-br shadow-sm",
        activeOutfit ? HERO_GRADIENT[activeOutfit.day_type] : "from-primary/10 via-primary/5 to-card",
      )}
    >
      <CardContent className="space-y-4 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {greeting}, {displayName}
          </p>
          <p className="text-xl font-semibold tracking-tight sm:text-2xl">
            {formatFriendlyDate(today)}
          </p>
        </div>

        {outfits.length > 0 ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">
                {outfits.length === 1 ? "Today's log" : `${outfits.length} outfits logged`}
              </span>
              {config ? <Badge className={config.badgeClass}>{config.label}</Badge> : null}
            </div>

            {hasMultiple ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Previous outfit"
                  disabled={safeIndex === 0}
                  onClick={goPrev}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-center text-xs text-muted-foreground">
                    Outfit {safeIndex + 1} of {outfits.length}
                  </p>
                  <OutfitItemsPreview outfit={activeOutfit} variant="hero" centered />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Next outfit"
                  disabled={safeIndex === outfits.length - 1}
                  onClick={goNext}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            ) : (
              <OutfitItemsPreview outfit={activeOutfit} variant="hero" centered />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing logged yet. Capture what kind of day it is and what you wore.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button
            className="h-10 w-full"
            nativeButton={false}
            render={<Link href={hubHref} />}
          >
            {viewLabel}
          </Button>

          {outfits.length > 0 && canAddOutfit ? (
            <Button
              className="h-9 w-full"
              variant="outline"
              nativeButton={false}
              render={<Link href={addHref} />}
            >
              <Plus className="size-4" />
              Add outfit
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
