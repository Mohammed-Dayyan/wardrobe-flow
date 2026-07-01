"use client";

import Link from "next/link";
import { getDisplayName, getDisplayNameInitial } from "@/features/profile/lib/display-name";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";

interface AuthSessionPanelProps {
  profile: Profile | null;
  email: string;
}

export function AuthSessionPanel({ profile, email }: AuthSessionPanelProps) {
  const displayName = getDisplayName(profile);
  const initial = getDisplayNameInitial(profile);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
          aria-hidden
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p className="font-medium">{displayName}</p>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">You&apos;re already signed in.</p>

      <div className="space-y-3">
        <Button className="h-11 w-full" nativeButton={false} render={<Link href="/dashboard" />}>
          Go to dashboard
        </Button>
        <SignOutButton />
      </div>
    </div>
  );
}
