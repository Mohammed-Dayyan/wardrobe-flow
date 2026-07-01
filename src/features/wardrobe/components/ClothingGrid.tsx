import Link from "next/link";
import { Plus } from "lucide-react";
import type { ClothingItem } from "@/types/database";
import { ClothingItemCard } from "@/features/wardrobe/components/ClothingItemCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";

interface ClothingGridProps {
  items: ClothingItem[];
  hasFilters: boolean;
  referencedIds: string[];
}

export function ClothingGrid({ items, hasFilters, referencedIds }: ClothingGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={hasFilters ? "No items match your filters" : "No clothing items yet"}
        description={
          hasFilters
            ? "Try adjusting your search or category filter."
            : "Add tops, pants, jackets, and shoes to start building your wardrobe."
        }
        action={
          !hasFilters ? (
            <Button nativeButton={false} render={<Link href="/wardrobe/new" />}>
              <Plus className="size-4" />
              Add your first item
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {items.map((item) => (
        <ClothingItemCard
          key={item.id}
          item={item}
          isReferenced={referencedIds.includes(item.id)}
        />
      ))}
    </div>
  );
}
