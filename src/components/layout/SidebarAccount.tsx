import Link from "next/link";
import type { Profile } from "@/types/database";
import {
  getDisplayName,
  getDisplayNameInitial,
} from "@/features/profile/lib/display-name";
import { cn } from "@/lib/utils";

interface SidebarAccountProps {
  profile: Profile | null;
  email?: string;
  className?: string;
}

export function SidebarAccount({ profile, email, className }: SidebarAccountProps) {
  const displayName = getDisplayName(profile);
  const initial = getDisplayNameInitial(profile);

  return (
    <Link
      href="/settings"
      className={cn(
        "flex items-center gap-3 border-t border-border px-4 py-4 transition-colors hover:bg-muted/50",
        className,
      )}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
        aria-hidden
      >
        {initial}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{displayName}</span>
        {email ? (
          <span className="block truncate text-xs text-muted-foreground">{email}</span>
        ) : null}
      </span>
    </Link>
  );
}
