export function mapSupabaseError(message: string, fallback: string): string {
  if (!message || message.length > 200) {
    return fallback;
  }

  const normalized = message.toLowerCase();

  if (
    normalized.includes("duplicate key") ||
    normalized.includes("violates") ||
    normalized.includes("permission denied")
  ) {
    return fallback;
  }

  return fallback;
}
