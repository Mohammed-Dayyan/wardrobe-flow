import { Flame } from "lucide-react";
import { PRODUCT_PREVIEW } from "@/components/marketing/marketing-content";
import { CLOTHING_CATEGORY_LABELS } from "@/lib/validations/categories";
import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ProductPreview({ className }: { className?: string }) {
  const config = DAY_TYPE_CONFIG.office;

  return (
    <div className={cn("relative mx-auto w-full max-w-[280px] md:max-w-sm", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-indigo-400/15 blur-2xl"
      />

      <div className="relative rounded-[2rem] bg-foreground/5 p-2 shadow-xl ring-1 ring-foreground/10">
        <div
          aria-hidden
          className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-foreground/15"
        />
        <Card
          className={cn(
            "relative overflow-hidden border-0 bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-card shadow-none",
          )}
        >
          <CardContent className="space-y-4 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {PRODUCT_PREVIEW.greeting}
              </p>
              <p className="text-xl font-semibold tracking-tight">
                {PRODUCT_PREVIEW.date}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{PRODUCT_PREVIEW.logLabel}</span>
                <Badge className={config.badgeClass}>{config.label}</Badge>
              </div>

              <ul className="flex w-full flex-col items-stretch gap-2">
                {PRODUCT_PREVIEW.items.map((item) => (
                  <li
                    key={item.role}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-sm shadow-sm"
                  >
                    <span
                      className="size-3 shrink-0 rounded-full border border-border/80"
                      style={{ backgroundColor: item.color }}
                      aria-hidden
                    />
                    <span className="text-muted-foreground">
                      {CLOTHING_CATEGORY_LABELS[item.role]}
                    </span>
                    <span className="truncate font-medium">{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="size-4 text-orange-500" aria-hidden />
              <span>{PRODUCT_PREVIEW.streak}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
