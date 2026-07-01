import { getSiteMetadata } from "@/lib/metadata/site";
import { getUser } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Hero } from "@/components/marketing/Hero";
import { DayTypeShowcase } from "@/components/marketing/DayTypeShowcase";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { CtaSection } from "@/components/marketing/CtaSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MobileStickyCta } from "@/components/marketing/MobileStickyCta";

export const metadata = getSiteMetadata();

export default async function HomePage() {
  const user = await getUser();
  const isAuthenticated = !!user;

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md"
      >
        Skip to main content
      </a>
      <MarketingHeader isAuthenticated={isAuthenticated} />
      <main id="main-content" className="flex-1">
        <Hero isAuthenticated={isAuthenticated} />
        <DayTypeShowcase />
        <HowItWorks />
        <FeatureGrid />
        <CtaSection isAuthenticated={isAuthenticated} />
      </main>
      <MarketingFooter isAuthenticated={isAuthenticated} />
      <MobileStickyCta isAuthenticated={isAuthenticated} />
    </div>
  );
}
