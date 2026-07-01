"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MobileStickyCtaProps {
  isAuthenticated: boolean;
}

export function MobileStickyCta({ isAuthenticated }: MobileStickyCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="mx-auto max-w-lg pb-[env(safe-area-inset-bottom)]">
        {isAuthenticated ? (
          <Button
            size="lg"
            className="h-11 w-full"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Go to app
          </Button>
        ) : (
          <Button
            size="lg"
            className="h-11 w-full"
            nativeButton={false}
            render={<Link href="/signup" />}
          >
            Get started free
          </Button>
        )}
      </div>
    </div>
  );
}
