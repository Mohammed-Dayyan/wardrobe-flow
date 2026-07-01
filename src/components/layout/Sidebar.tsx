"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/types/database";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import { SidebarAccount } from "@/components/layout/SidebarAccount";

interface SidebarProps {
  profile: Profile | null;
  email?: string;
}

export function Sidebar({ profile, email }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:sticky md:top-0 md:flex md:h-svh md:w-64 md:shrink-0 md:flex-col border-r border-border bg-card">
      <div className="flex h-14 shrink-0 items-center justify-center border-b border-border px-6">
        <Logo href="/dashboard" size="md" />
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.matchPrefix && pathname.startsWith(item.matchPrefix));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <SidebarAccount profile={profile} email={email} className="shrink-0" />
    </aside>
  );
}
