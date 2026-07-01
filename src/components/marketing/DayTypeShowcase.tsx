import type { DayType } from "@/types/database";
import {
  DAY_TYPE_EXAMPLES,
  DAY_TYPE_SHOWCASE,
} from "@/components/marketing/marketing-content";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { DAY_TYPE_CONFIG, DAY_TYPES } from "@/lib/validations/day-types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DAY_TYPE_GRADIENT: Record<DayType, string> = {
  office: "from-indigo-500/15 via-indigo-500/5 to-card",
  stay_home: "from-emerald-500/15 via-emerald-500/5 to-card",
  travel: "from-sky-500/15 via-sky-500/5 to-card",
  day_out: "from-rose-500/15 via-rose-500/5 to-card",
};

function DayTypeCard({ dayType }: { dayType: DayType }) {
  const config = DAY_TYPE_CONFIG[dayType];

  return (
    <Card
      className={cn(
        "h-full border-border/60 bg-gradient-to-br shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        config.borderClass,
        DAY_TYPE_GRADIENT[dayType],
      )}
    >
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <span
            className={cn("size-3 shrink-0 rounded-full", config.dotClass)}
            aria-hidden
          />
          <span className="text-sm font-semibold">{config.label}</span>
        </div>
        <p className="text-sm text-muted-foreground">{DAY_TYPE_EXAMPLES[dayType]}</p>
      </CardContent>
    </Card>
  );
}

export function DayTypeShowcase() {
  return (
    <MarketingSection
      title={DAY_TYPE_SHOWCASE.title}
      subcopy={DAY_TYPE_SHOWCASE.subcopy}
      variant="plain"
    >
      <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:hidden">
        {DAY_TYPES.map((dayType) => (
          <div
            key={dayType}
            className="w-[78vw] max-w-xs shrink-0 snap-center"
          >
            <DayTypeCard dayType={dayType} />
          </div>
        ))}
      </div>

      <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {DAY_TYPES.map((dayType) => (
          <DayTypeCard key={dayType} dayType={dayType} />
        ))}
      </div>
    </MarketingSection>
  );
}
