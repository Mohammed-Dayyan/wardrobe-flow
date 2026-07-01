import Link from "next/link";
import { CTA } from "@/components/marketing/marketing-content";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { Button } from "@/components/ui/button";

interface CtaSectionProps {
  isAuthenticated: boolean;
}

export function CtaSection({ isAuthenticated }: CtaSectionProps) {
  return (
    <MarketingSection variant="plain" title="">
      <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-primary/5 p-6 text-center shadow-sm sm:p-10">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {CTA.title}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">{CTA.subcopy}</p>

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center">
          {isAuthenticated ? (
            <Button
              size="lg"
              className="h-11 w-full sm:w-auto"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              Go to app
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                className="h-11 w-full sm:w-auto"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Get started free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 w-full sm:w-auto"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Sign in
              </Button>
            </>
          )}
        </div>
      </div>
    </MarketingSection>
  );
}
