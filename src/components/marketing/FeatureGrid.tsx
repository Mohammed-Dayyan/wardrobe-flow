import { FEATURES } from "@/components/marketing/marketing-content";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function FeatureCard({
  feature,
}: {
  feature: (typeof FEATURES.items)[number];
}) {
  const Icon = feature.icon;

  return (
    <Card className="h-full border-border/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
        <CardTitle className="text-base">{feature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
}

export function FeatureGrid() {
  return (
    <MarketingSection
      title={FEATURES.title}
      subcopy={FEATURES.subcopy}
      variant="tinted"
    >
      <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:hidden">
        {FEATURES.items.map((feature) => (
          <div key={feature.title} className="w-[85vw] max-w-sm shrink-0 snap-center">
            <FeatureCard feature={feature} />
          </div>
        ))}
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.items.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </MarketingSection>
  );
}
