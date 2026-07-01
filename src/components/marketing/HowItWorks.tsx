import { HOW_IT_WORKS } from "@/components/marketing/marketing-content";
import { MarketingSection } from "@/components/marketing/MarketingSection";

export function HowItWorks() {
  return (
    <MarketingSection
      title={HOW_IT_WORKS.title}
      subcopy={HOW_IT_WORKS.subcopy}
      variant="muted"
      className="mx-4 rounded-3xl md:mx-auto md:rounded-none"
    >
      <ol className="relative space-y-8 md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
        {HOW_IT_WORKS.steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === HOW_IT_WORKS.steps.length - 1;

          return (
            <li key={step.title} className="relative flex gap-4 md:flex-col md:gap-4">
              <div className="relative flex flex-col items-center md:flex-row md:items-start md:gap-3">
                {!isLast ? (
                  <span
                    aria-hidden
                    className="absolute top-8 bottom-0 left-4 w-0.5 -translate-x-1/2 bg-primary/20 md:hidden"
                  />
                ) : null}
                <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <div className="hidden size-11 items-center justify-center rounded-xl bg-primary/10 text-primary md:flex">
                  <Icon className="size-5" aria-hidden />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-2 pb-2 md:pb-0">
                <div className="flex items-center gap-2 md:hidden">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold">{step.title}</h3>
                </div>
                <h3 className="hidden text-base font-semibold md:block">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </MarketingSection>
  );
}
