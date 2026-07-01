import {
  TIMEZONE_COOKIE_MAX_AGE_SECONDS,
  TIMEZONE_COOKIE_NAME,
} from "@/lib/timezone/constants";
import { isValidTimezone } from "@/lib/timezone/is-valid-timezone";

export function readBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function readCookieTimezone(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${TIMEZONE_COOKIE_NAME}=`));

  if (!match) {
    return null;
  }

  const value = decodeURIComponent(match.split("=")[1] ?? "");
  return isValidTimezone(value) ? value : null;
}

export function writeTimezoneCookie(timeZone: string) {
  document.cookie = `${TIMEZONE_COOKIE_NAME}=${encodeURIComponent(timeZone)}; Path=/; SameSite=Lax; Max-Age=${TIMEZONE_COOKIE_MAX_AGE_SECONDS}`;
}

export function getValidBrowserTimezone(): string | null {
  const timeZone = readBrowserTimezone();
  return isValidTimezone(timeZone) ? timeZone : null;
}
