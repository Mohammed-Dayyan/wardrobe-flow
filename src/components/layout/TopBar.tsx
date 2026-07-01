"use client";

import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { getPageTitle } from "@/components/layout/nav-config";

export function TopBar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="mx-auto flex w-full max-w-lg items-center justify-between">
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        <Logo href="/dashboard" size="sm" variant="tile" showText={false} />
      </div>
    </header>
  );
}
