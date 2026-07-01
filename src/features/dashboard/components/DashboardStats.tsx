import Link from "next/link";
import {
  Briefcase,
  CalendarDays,
  Flame,
  Shirt,
  type LucideIcon,
} from "lucide-react";
import type { DashboardStats } from "@/features/dashboard/queries/get-dashboard-stats";
import type { WardrobeSummary } from "@/features/wardrobe/queries/get-wardrobe-summary";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  wardrobeSummary: WardrobeSummary;
  stats: DashboardStats;
}

const STAT_ICONS = {
  wardrobe: Shirt,
  outfits: CalendarDays,
  streak: Flame,
  office: Briefcase,
} satisfies Record<string, LucideIcon>;

export function DashboardStats({ wardrobeSummary, stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatTile
        href="/wardrobe"
        label="Wardrobe items"
        value={wardrobeSummary.total}
        icon={STAT_ICONS.wardrobe}
      />
      <StatTile
        href="/history?view=calendar"
        label="Outfits logged"
        value={stats.monthLogCount}
        icon={STAT_ICONS.outfits}
      />
      <StatTile
        label="Current streak"
        value={stats.streak}
        suffix={stats.streak === 1 ? "day" : "days"}
        icon={STAT_ICONS.streak}
      />
      <StatTile
        href="/analytics"
        label="Office logs"
        value={stats.officeDaysThisMonth}
        suffix={stats.officeDaysThisMonth === 1 ? "log" : "logs"}
        icon={STAT_ICONS.office}
      />
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: number;
  suffix?: string;
  href?: string;
  icon: LucideIcon;
}

function StatTile({ label, value, suffix, href, icon: Icon }: StatTileProps) {
  const content = (
    <Card
      className={cn(
        "border-border/60 bg-gradient-to-br from-muted/40 to-card shadow-sm transition-colors",
        href && "hover:bg-muted/30",
      )}
    >
      <CardContent className="flex items-center justify-between gap-3 p-3.5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
            {value}
            {suffix ? (
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                {suffix}
              </span>
            ) : null}
          </p>
        </div>
        <Icon className="size-5 shrink-0 text-muted-foreground/60" aria-hidden />
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
