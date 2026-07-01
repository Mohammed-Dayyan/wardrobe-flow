import Link from "next/link";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { HERO, TRUST_PILLS } from "@/components/marketing/marketing-content";
import { Button } from "@/components/ui/button";

interface HeroProps {
  isAuthenticated: boolean;
}

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl md:size-96"
      />

      <div className="relative mx-auto grid max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:gap-12 md:py-24">
        <ProductPreview className="order-1 justify-self-center md:order-2 md:justify-self-end" />

        <div className="order-2 text-center md:order-1 md:text-left">
          <p className="mb-3 text-sm font-medium tracking-wide text-primary uppercase">
            {HERO.eyebrow}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]">
            {HERO.headline}
            <br />
            <span className="text-primary">{HERO.headlineAccent}</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:mt-6 md:text-lg">
            {HERO.subcopy}
          </p>

          <ul className="scrollbar-hide -mx-4 mt-5 flex items-center justify-start gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:justify-start md:overflow-visible md:px-0">
            {TRUST_PILLS.map((pill) => {
              const Icon = pill.icon;
              return (
                <li
                  key={pill.label}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm"
                >
                  <Icon className="size-3.5 shrink-0 text-primary" aria-hidden />
                  {pill.label}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center md:mt-8 md:justify-start">
            {isAuthenticated ? (
              <Button
                size="lg"
                className="hidden h-11 w-full sm:w-auto md:inline-flex"
                nativeButton={false}
                render={<Link href="/dashboard" />}
              >
                Go to app
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="hidden h-11 w-full sm:w-auto md:inline-flex"
                  nativeButton={false}
                  render={<Link href="/signup" />}
                >
                  Get started free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="hidden h-11 w-full sm:w-auto md:inline-flex"
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
