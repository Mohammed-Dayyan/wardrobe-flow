export function getDisplayName(profile?: { display_name?: string | null } | null): string {
  const trimmed = profile?.display_name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "User";
}

export function getDisplayNameInitial(profile?: { display_name?: string | null } | null): string {
  const name = getDisplayName(profile);
  return name.charAt(0).toUpperCase();
}
