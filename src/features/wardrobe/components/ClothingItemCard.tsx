"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Layers,
  Pencil,
  PersonStanding,
  Shirt,
  SportShoe,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ClothingItem } from "@/types/database";
import type { ClothingCategory } from "@/lib/validations/categories";
import { CLOTHING_CATEGORY_LABELS } from "@/lib/validations/categories";
import { ClothingDeleteDialog } from "@/features/wardrobe/components/ClothingDeleteDialog";
import { ClothingArchiveDialog } from "@/features/wardrobe/components/ClothingArchiveDialog";
import { unarchiveClothingItemAction } from "@/features/wardrobe/actions/unarchive-clothing-item";
import { runServerAction } from "@/lib/feedback/run-server-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<ClothingCategory, LucideIcon> = {
  top: Shirt,
  pants: PersonStanding,
  jacket: Layers,
  shoes: SportShoe,
};

interface ClothingItemCardProps {
  item: ClothingItem;
  isReferenced: boolean;
}

export function ClothingItemCard({ item, isReferenced }: ClothingItemCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const isArchived = Boolean(item.archived_at);
  const categoryLabel = CLOTHING_CATEGORY_LABELS[item.category] ?? item.category;
  const CategoryIcon = CATEGORY_ICONS[item.category] ?? Shirt;

  const handleUnarchive = () => {
    startTransition(async () => {
      const result = await runServerAction(
        () => unarchiveClothingItemAction(item.id),
        "Item restored",
      );
      if (!result) {
        return;
      }

      router.refresh();
    });
  };

  return (
    <>
      <Card
        size="sm"
        className={cn(
          "gap-0 border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          isArchived && "opacity-70",
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-1">
            <Link
              href={`/wardrobe?item=${item.id}`}
              aria-label={`View wear history for ${item.name}`}
              className="min-w-0 flex-1 rounded-md outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight">
                  {item.name}
                </h3>
                {isArchived ? (
                  <Badge
                    variant="secondary"
                    className="h-4 shrink-0 px-1 text-[9px] uppercase tracking-wide"
                  >
                    Archived
                  </Badge>
                ) : null}
              </div>

              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CategoryIcon className="size-3 shrink-0" aria-hidden />
                <span>{categoryLabel}</span>
                <span aria-hidden>·</span>
                <span
                  className="size-2.5 shrink-0 rounded-full border border-border/70"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                <span className="line-clamp-1 capitalize">{item.color}</span>
              </div>

              {item.notes ? (
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">
                  {item.notes}
                </p>
              ) : null}
            </Link>

            <div className="-mr-1 -mt-0.5 flex shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                nativeButton={false}
                render={
                  <Link href={`/wardrobe/${item.id}/edit`} aria-label={`Edit ${item.name}`} />
                }
              >
                <Pencil className="size-3.5" />
              </Button>
              {isArchived ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Restore ${item.name}`}
                  disabled={isPending}
                  onClick={handleUnarchive}
                >
                  <ArchiveRestore className="size-3.5" />
                </Button>
              ) : isReferenced ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Archive ${item.name}`}
                  onClick={() => setShowArchiveDialog(true)}
                >
                  <Archive className="size-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ClothingDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        itemId={item.id}
        itemName={item.name}
        onDeleted={() => router.refresh()}
      />

      <ClothingArchiveDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        itemId={item.id}
        itemName={item.name}
        onArchived={() => router.refresh()}
      />
    </>
  );
}
