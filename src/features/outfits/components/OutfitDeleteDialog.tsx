"use client";

import { useTransition } from "react";
import { deleteOutfitByIdAction } from "@/features/outfits/actions/delete-outfit-by-id";
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

interface OutfitDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfitId: string;
  onDeleted?: () => void;
}

export function OutfitDeleteDialog({
  open,
  onOpenChange,
  outfitId,
  onDeleted,
}: OutfitDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await runServerAction(
        () => deleteOutfitByIdAction(outfitId),
        "Outfit deleted",
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
          <DialogTitle>Delete this outfit?</DialogTitle>
          <DialogDescription>
            This will remove this outfit log and its wear records for this day.
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
