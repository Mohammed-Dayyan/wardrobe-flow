export const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Check your connection and try again.";

export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();

  return (
    normalized.includes("failed to fetch") ||
    normalized.includes("networkerror") ||
    normalized.includes("network request failed") ||
    normalized.includes("load failed") ||
    (error instanceof TypeError && normalized.includes("fetch"))
  );
}

export function mapThrownError(
  error: unknown,
  fallback = "Something went wrong",
): string {
  return isNetworkError(error) ? NETWORK_ERROR_MESSAGE : fallback;
}
