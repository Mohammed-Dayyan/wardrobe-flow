export function isValidTimezone(timeZone: string): boolean {
  if (!timeZone.trim()) {
    return false;
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}
