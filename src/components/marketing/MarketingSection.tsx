import { cn } from "@/lib/utils";

type MarketingSectionVariant = "plain" | "tinted" | "muted";

interface MarketingSectionProps {
  title: string;
  subcopy?: string;
  variant?: MarketingSectionVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<MarketingSectionVariant, string> = {
  plain: "bg-background",
  tinted: "bg-primary/5",
  muted: "bg-muted/40",
};

export function MarketingSection({
  title,
  subcopy,
  variant = "plain",
  className,
  children,
}: MarketingSectionProps) {
  return (
    <section className={cn(variantClasses[variant], "py-12 md:py-20")}>
      <div
        className={cn(
          "mx-auto max-w-5xl px-4 md:rounded-none md:px-4",
          variant !== "plain" && "rounded-2xl md:mx-auto md:max-w-5xl",
          className,
        )}
      >
        {title ? (
          <div className="mx-auto max-w-2xl text-center md:mx-0 md:text-left">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
            {subcopy ? (
              <p className="mt-2 text-muted-foreground">{subcopy}</p>
            ) : null}
          </div>
        ) : null}
        <div className={cn(title && "mt-8 md:mt-10")}>{children}</div>
      </div>
    </section>
  );
}
