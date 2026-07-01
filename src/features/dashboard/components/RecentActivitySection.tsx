import Link from "next/link";
import { formatFriendlyDateWithYear } from "@/lib/utils/date";
import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import type { RecentActivityItem } from "@/features/dashboard/queries/get-recent-activity";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const BORDER_ACCENT: Record<string, string> = {
  office: "border-l-indigo-500",
  stay_home: "border-l-emerald-500",
  travel: "border-l-sky-500",
  day_out: "border-l-rose-500",
};

interface RecentActivitySectionProps {
  items: RecentActivityItem[];
}

export function RecentActivitySection({ items }: RecentActivitySectionProps) {
  const displayItems = items.slice(0, 5);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">Recent</h2>
        <Link href="/history" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="sr-only">
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {displayItems.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No activity in the last 7 days.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {displayItems.map((item) => {
                const config = DAY_TYPE_CONFIG[item.day_type];

                return (
                  <li key={item.id}>
                    <Link
                      href={`/outfits/${item.date}`}
                      className={cn(
                        "block border-l-4 p-4 transition-colors hover:bg-muted/40",
                        BORDER_ACCENT[item.day_type],
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{formatFriendlyDateWithYear(item.date)}</span>
                        <Badge className={config.badgeClass}>{config.label}</Badge>
                      </div>
                      {item.summary ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {item.summary}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
