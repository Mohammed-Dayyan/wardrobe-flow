"use client";

import { useTransition } from "react";
import { archiveClothingItemAction } from "@/features/wardrobe/actions/archive-clothing-item";
import { runServerAction } from "@/lib/feedback/run-server-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ClothingArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemName: string;
  onArchived?: () => void;
}

export function ClothingArchiveDialog({
  open,
  onOpenChange,
  itemId,
  itemName,
  onArchived,
}: ClothingArchiveDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleArchive = () => {
    startTransition(async () => {
      const result = await runServerAction(
        () => archiveClothingItemAction(itemId),
        "Item archived",
      );
      if (!result) {
        return;
      }

      onOpenChange(false);
      onArchived?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive {itemName}?</DialogTitle>
          <DialogDescription>
            Archive hides this item from logging and your wardrobe. It will still
            appear in outfit history.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleArchive} disabled={isPending}>
            {isPending ? "Archiving…" : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
