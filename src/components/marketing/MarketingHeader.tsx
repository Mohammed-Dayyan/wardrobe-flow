import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

interface MarketingHeaderProps {
  isAuthenticated: boolean;
}

export function MarketingHeader({ isAuthenticated }: MarketingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Logo href="/" size="md" />
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              className="max-md:h-9 max-md:px-3 max-md:text-sm"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              Go to app
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden md:inline-flex"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Sign in
              </Button>
              <Button
                className="max-md:h-9 max-md:px-3 max-md:text-sm"
                nativeButton={false}
                render={<Link href="/signup" />}
              >
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
