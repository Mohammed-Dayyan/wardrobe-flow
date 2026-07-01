import { cn } from "@/lib/utils";

interface FormPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function FormPanel({ children, className }: FormPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-foreground/5 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {title ? (
        <div>
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
