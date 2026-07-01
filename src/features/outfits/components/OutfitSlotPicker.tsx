"use client";

import Link from "next/link";
import type { ClothingItem } from "@/types/database";
import type { ClothingCategory } from "@/lib/validations/categories";
import { CLOTHING_CATEGORY_LABELS } from "@/lib/validations/categories";
import {
  OFFICE_REQUIRED_SLOTS,
  OUTFIT_SLOT_ORDER,
} from "@/features/outfits/constants/outfit-slots";
import {
  findPickerItem,
  formatPickerItemLabel,
  fromPickerValue,
  PICKER_PLACEHOLDER,
  toPickerValue,
} from "@/features/outfits/lib/picker-utils";
import { RepetitionWarning } from "@/features/outfits/components/RepetitionWarning";
import type { WearHintsMap } from "@/features/outfits/queries/get-wear-hints";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OutfitSlotPickerProps {
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

const OPTIONAL_SLOTS: ClothingCategory[] = ["jacket", "shoes"];

function CategorySelect({
  role,
  items,
  selectedId,
  onChange,
  error,
  wearHints,
  optional,
}: {
  role: ClothingCategory;
  items: ClothingItem[];
  selectedId: string;
  onChange: (value: string) => void;
  error?: string;
  wearHints: WearHintsMap;
  optional: boolean;
}) {
  const label = CLOTHING_CATEGORY_LABELS[role];
  const placeholder = `Select ${label.toLowerCase()}`;
  const pickerValue = toPickerValue(selectedId);

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {optional ? (
          <span className="ml-1.5 font-normal text-muted-foreground">(optional)</span>
        ) : null}
      </Label>

      <Select
        value={pickerValue}
        onValueChange={(value) => onChange(fromPickerValue(value))}
        items={[
          { value: PICKER_PLACEHOLDER, label: placeholder },
          ...items.map((item) => ({
            value: item.id,
            label: formatPickerItemLabel(item),
          })),
        ]}
      >
        <SelectTrigger className="h-11 w-full bg-background">
          <SelectValue placeholder={placeholder}>
            {(value) => {
              if (!value || value === PICKER_PLACEHOLDER) return placeholder;
              const item = findPickerItem(items, String(value));
              return item ? formatPickerItemLabel(item) : null;
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          alignItemWithTrigger={false}
          className="min-w-[var(--anchor-width)] w-[var(--anchor-width)]"
        >
          <SelectItem
            value={PICKER_PLACEHOLDER}
            className="py-2.5 text-muted-foreground"
          >
            {placeholder}
          </SelectItem>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id} className="py-2.5">
              <span className="font-medium">{item.name}</span>
              <span className="text-muted-foreground">{item.color}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedId && wearHints[selectedId] ? (
        <RepetitionWarning warnings={wearHints[selectedId]} />
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function OutfitSlotPicker({
  itemsByCategory,
  wearHints,
  values,
  onChange,
  errors,
}: OutfitSlotPickerProps) {
  const hasRequiredItems = OFFICE_REQUIRED_SLOTS.some(
    (role) => itemsByCategory[role].length > 0,
  );

  if (!hasRequiredItems) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-5 text-center">
        <p className="text-sm text-muted-foreground">
          Add tops and pants to your wardrobe before logging an office outfit.
        </p>
        <Button
          className="mt-3"
          size="sm"
          nativeButton={false}
          render={<Link href="/wardrobe/new" />}
        >
          Add to wardrobe
        </Button>
      </div>
    );
  }

  const renderSlot = (role: ClothingCategory) => {
    const fieldKey = `${role}_id` as keyof typeof values;
    const items = itemsByCategory[role];
    const label = CLOTHING_CATEGORY_LABELS[role];
    const optional = OPTIONAL_SLOTS.includes(role);

    if (items.length === 0) {
      return (
        <div
          key={role}
          className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-3"
        >
          <Label>
            {label}
            {optional ? (
              <span className="ml-1.5 font-normal text-muted-foreground">(optional)</span>
            ) : null}
          </Label>
          <p className="mt-1 text-sm text-muted-foreground">
            No {label.toLowerCase()} in wardrobe yet.
          </p>
          <Button
            className="mt-2 h-8 px-0"
            variant="link"
            size="sm"
            nativeButton={false}
            render={<Link href="/wardrobe/new" />}
          >
            Add {label.toLowerCase()}
          </Button>
        </div>
      );
    }

    return (
      <CategorySelect
        key={role}
        role={role}
        items={items}
        selectedId={values[fieldKey]}
        onChange={(value) => onChange(role, value)}
        error={errors[fieldKey]}
        wearHints={wearHints}
        optional={optional}
      />
    );
  };

  return (
    <div className="space-y-5">
      {OUTFIT_SLOT_ORDER.map(renderSlot)}
    </div>
  );
}
