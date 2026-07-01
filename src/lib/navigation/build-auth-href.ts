export function buildAuthHref(path: string, next?: string): string {
  if (!next) {
    return path;
  }

  return `${path}?next=${encodeURIComponent(next)}`;
}
