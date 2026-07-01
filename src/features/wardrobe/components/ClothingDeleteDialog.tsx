"use client";

import { useTransition } from "react";
import { deleteClothingItemAction } from "@/features/wardrobe/actions/delete-clothing-item";
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

interface ClothingDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemName: string;
  onDeleted?: () => void;
}

export function ClothingDeleteDialog({
  open,
  onOpenChange,
  itemId,
  itemName,
  onDeleted,
}: ClothingDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await runServerAction(
        () => deleteClothingItemAction(itemId),
        "Item deleted",
      );
      if (!result) {
        return;
      }

      onOpenChange(false);
      onDeleted?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {itemName}?</DialogTitle>
          <DialogDescription>
            This cannot be undone. If this item appears in outfit history, deletion will
            be blocked.
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
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
