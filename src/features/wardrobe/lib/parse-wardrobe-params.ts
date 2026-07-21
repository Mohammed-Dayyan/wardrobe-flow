const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ParsedWardrobeParams {
  itemId: string | null;
}

interface WardrobeSearchParams {
  item?: string;
}

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function parseWardrobeParams(
  params: WardrobeSearchParams,
): ParsedWardrobeParams {
  const raw = params.item?.trim();
  const itemId = raw && isUuid(raw) ? raw : null;
  return { itemId };
}
