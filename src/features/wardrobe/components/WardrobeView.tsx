"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Plus, Search } from "lucide-react";
import type { ClothingCategory, ClothingItem } from "@/types/database";
import {
  CLOTHING_CATEGORIES,
  CLOTHING_CATEGORY_LABELS,
} from "@/lib/validations/categories";
import {
  countArchivedClothingItems,
  filterClothingItems,
} from "@/features/wardrobe/lib/filter-clothing-items";
import { ClothingGrid } from "@/features/wardrobe/components/ClothingGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface WardrobeViewProps {
  items: ClothingItem[];
  referencedIds: string[];
}

export function WardrobeView({ items, referencedIds }: WardrobeViewProps) {
  const [category, setCategory] = useState<ClothingCategory | undefined>();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const archivedCount = useMemo(() => countArchivedClothingItems(items), [items]);

  const filteredItems = useMemo(
    () => filterClothingItems(items, { category, search, showArchived }),
    [items, category, search, showArchived],
  );

  const hasFilters = !!category || !!search.trim() || showArchived;

  const countLabel = (() => {
    if (showArchived) {
      if (archivedCount === 0) {
        return `${filteredItems.length} item${filteredItems.length === 1 ? "" : "s"}`;
      }
      return `${filteredItems.length} shown · ${archivedCount} archived`;
    }

    if (archivedCount > 0) {
      return `${filteredItems.length} active item${filteredItems.length === 1 ? "" : "s"}`;
    }

    return `${filteredItems.length} item${filteredItems.length === 1 ? "" : "s"}`;
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wardrobe</h1>
          <p className="mt-1 text-sm text-muted-foreground">{countLabel}</p>
        </div>
        <Button
          className="h-11 w-full shrink-0 sm:w-auto"
          nativeButton={false}
          render={<Link href="/wardrobe/new" />}
        >
          <Plus className="size-4" />
          Add item
        </Button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="All"
              active={!category}
              onClick={() => setCategory(undefined)}
            />
            {CLOTHING_CATEGORIES.map((value) => (
              <FilterChip
                key={value}
                label={CLOTHING_CATEGORY_LABELS[value]}
                active={category === value}
                onClick={() => setCategory(category === value ? undefined : value)}
              />
            ))}
          </div>

          {archivedCount > 0 ? (
            <ShowArchivedToggle
              active={showArchived}
              count={archivedCount}
              onClick={() => setShowArchived((value) => !value)}
            />
          ) : null}
        </div>
      </div>

      <ClothingGrid
        items={filteredItems}
        hasFilters={hasFilters}
        referencedIds={referencedIds}
      />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function ShowArchivedToggle({
  active,
  count,
  onClick,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "outline"}
      size="sm"
      onClick={onClick}
      aria-pressed={active}
      className="h-8 shrink-0 shadow-sm"
    >
      <Archive className="size-3.5" />
      {active ? "Showing archived" : "Show archived"}
      <span className="rounded-md bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ring-1 ring-border/70">
        {count}
      </span>
    </Button>
  );
}
