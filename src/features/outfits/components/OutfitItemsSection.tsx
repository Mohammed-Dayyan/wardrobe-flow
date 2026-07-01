"use client";

import type { ClothingItem } from "@/types/database";
import type { ClothingCategory } from "@/lib/validations/categories";
import type { DayType } from "@/types/database";
import { getOutfitSectionCopy } from "@/lib/validations/day-types";
import { OutfitSlotPicker } from "@/features/outfits/components/OutfitSlotPicker";
import type { WearHintsMap } from "@/features/outfits/queries/get-wear-hints";

interface OutfitItemsSectionProps {
  dayType: DayType;
  itemsByCategory: Record<ClothingCategory, ClothingItem[]>;
  wearHints: WearHintsMap;
  values: {
    top_id: string;
    pants_id: string;
    jacket_id: string;
    shoes_id: string;
  };
  onChange: (role: ClothingCategory, value: string) => void;
  errors: {
    top_id?: string;
    pants_id?: string;
    jacket_id?: string;
    shoes_id?: string;
  };
}

export function OutfitItemsSection({
  dayType,
  itemsByCategory,
  wearHints,
  values,
  onChange,
  errors,
}: OutfitItemsSectionProps) {
  const copy = getOutfitSectionCopy(dayType);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-foreground">{copy.title}</h2>
          {copy.description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{copy.description}</p>
          ) : null}
        </div>
        {copy.isOptional ? (
          <span className="shrink-0 rounded-full border border-border/80 bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Optional
          </span>
        ) : null}
      </div>

      <OutfitSlotPicker
        itemsByCategory={itemsByCategory}
        wearHints={wearHints}
        values={values}
        onChange={onChange}
        errors={errors}
      />
    </div>
  );
}
