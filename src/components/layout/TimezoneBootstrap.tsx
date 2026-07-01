"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { syncUserTimezoneAction } from "@/features/profile/actions/sync-timezone";
import {
  getValidBrowserTimezone,
  writeTimezoneCookie,
} from "@/lib/timezone/browser-timezone";

/** Shown while the timezone cookie is bootstrapped on first visit. */
export function TimezoneBootstrap() {
  const router = useRouter();

  useEffect(() => {
    const browserTimeZone = getValidBrowserTimezone();
    if (!browserTimeZone) {
      router.refresh();
      return;
    }

    writeTimezoneCookie(browserTimeZone);

    void syncUserTimezoneAction(browserTimeZone).finally(() => {
      router.refresh();
    });
  }, [router]);

  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
