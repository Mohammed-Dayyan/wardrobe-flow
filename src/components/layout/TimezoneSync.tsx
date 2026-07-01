"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { syncUserTimezoneAction } from "@/features/profile/actions/sync-timezone";
import {
  getValidBrowserTimezone,
  readCookieTimezone,
  writeTimezoneCookie,
} from "@/lib/timezone/browser-timezone";

export function TimezoneSync() {
  const router = useRouter();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (syncedRef.current) {
      return;
    }

    const browserTimeZone = getValidBrowserTimezone();
    if (!browserTimeZone) {
      return;
    }

    const cookieTimeZone = readCookieTimezone();
    if (cookieTimeZone === browserTimeZone) {
      syncedRef.current = true;
      return;
    }

    syncedRef.current = true;
    writeTimezoneCookie(browserTimeZone);

    void syncUserTimezoneAction(browserTimeZone).then((result) => {
      if (result.success) {
        router.refresh();
      }
    });
  }, [router]);

  return null;
}
