import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import { CLOTHING_CATEGORY_LABELS } from "@/lib/validations/categories";
import { hasOutfitItems } from "@/features/outfits/lib/format-outfit-summary";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";
import { cn } from "@/lib/utils";

interface OutfitItemsPreviewProps {
  outfit: OutfitWithItems | null;
  variant?: "hero" | "muted";
  emptyMessage?: string;
  centered?: boolean;
}

export function OutfitItemsPreview({
  outfit,
  variant = "hero",
  emptyMessage,
  centered = false,
}: OutfitItemsPreviewProps) {
  if (!outfit) {
    return null;
  }

  const config = DAY_TYPE_CONFIG[outfit.day_type];
  const pillClass =
    variant === "hero"
      ? "inline-flex max-w-full items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-sm shadow-sm"
      : "inline-flex max-w-full items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1.5 text-sm";

  if (!hasOutfitItems(outfit.outfit_items)) {
    return (
      <p
        className={cn(
          "text-sm text-muted-foreground",
          centered && "text-center",
        )}
      >
        {emptyMessage ?? `Logged as ${config.label}. No outfit items yet.`}
      </p>
    );
  }

  return (
    <ul
      className={cn(
        "flex flex-wrap gap-2",
        centered &&
          "justify-center max-sm:mx-auto max-sm:w-full max-sm:max-w-xs max-sm:flex-col max-sm:flex-nowrap max-sm:items-stretch",
      )}
    >
      {outfit.outfit_items.map((item) => (
        <li
          key={item.role}
          className={cn(pillClass, centered && "max-sm:w-full max-sm:justify-center")}
        >
          <span
            className="size-3 shrink-0 rounded-full border border-border/80"
            style={{ backgroundColor: item.clothing_items.color }}
            aria-hidden
          />
          <span className="text-muted-foreground">
            {CLOTHING_CATEGORY_LABELS[item.role]}
          </span>
          <span className="truncate font-medium">{item.clothing_items.name}</span>
        </li>
      ))}
    </ul>
  );
}
