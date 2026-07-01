import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

interface MarketingFooterProps {
  isAuthenticated?: boolean;
}

export function MarketingFooter({ isAuthenticated = false }: MarketingFooterProps) {
  return (
    <footer className="border-t border-border/60 bg-background py-8 md:py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 pb-20 md:pb-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
          <Logo href="/" size="md" />
          <p className="text-sm text-muted-foreground">
            Track your wardrobe, log your outfits.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium"
        >
          {isAuthenticated ? (
            <Link href="/dashboard" className="text-primary hover:underline">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground hover:underline md:text-muted-foreground"
              >
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>
    </footer>
  );
}
