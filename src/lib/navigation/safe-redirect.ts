export function sanitizeRedirectPath(
  next: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!next?.startsWith("/") || next.startsWith("//") || next.includes(":")) {
    return fallback;
  }
  return next;
}
