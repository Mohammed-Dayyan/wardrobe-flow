"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ClothingItem } from "@/types/database";
import {
  clothingItemFormSchema,
  type ClothingItemFormValues,
} from "@/features/wardrobe/schemas/clothing-item";
import { createClothingItemAction } from "@/features/wardrobe/actions/create-clothing-item";
import { updateClothingItemAction } from "@/features/wardrobe/actions/update-clothing-item";
import { ClothingDeleteDialog } from "@/features/wardrobe/components/ClothingDeleteDialog";
import { ClothingArchiveDialog } from "@/features/wardrobe/components/ClothingArchiveDialog";
import { unarchiveClothingItemAction } from "@/features/wardrobe/actions/unarchive-clothing-item";
import { FormPanel, FormSection } from "@/components/layout/FormPanel";
import { notifyFormValidationError } from "@/lib/feedback/toast";
import { runServerAction } from "@/lib/feedback/run-server-action";
import { navigateAfterMutation } from "@/lib/navigation/client-navigate";
import {
  CLOTHING_CATEGORIES,
  CLOTHING_CATEGORY_LABELS,
  type ClothingCategory,
} from "@/lib/validations/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClothingFormProps {
  mode: "create" | "edit";
  item?: ClothingItem;
  categoryLocked?: boolean;
  isReferenced?: boolean;
}

export function ClothingForm({
  mode,
  item,
  categoryLocked = false,
  isReferenced = false,
}: ClothingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const isArchived = Boolean(item?.archived_at);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ClothingItemFormValues>({
    resolver: zodResolver(clothingItemFormSchema),
    defaultValues: {
      name: item?.name ?? "",
      category: item?.category ?? "top",
      color: item?.color ?? "",
      notes: item?.notes ?? "",
    },
  });

  const onSubmit = handleSubmit(
    (values) => {
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("category", values.category);
      formData.set("color", values.color);
      formData.set("notes", values.notes ?? "");

      startTransition(async () => {
        const successMessage =
          mode === "create" ? "Item added to wardrobe" : "Item updated";
        const result = await runServerAction(
          () =>
            mode === "create"
              ? createClothingItemAction(formData)
              : updateClothingItemAction(item!.id, formData),
          successMessage,
        );
        if (!result) {
          return;
        }

        navigateAfterMutation(router, "/wardrobe");
      });
    },
    (errors) => notifyFormValidationError(errors),
  );

  const handleUnarchive = () => {
    if (!item) {
      return;
    }

    startTransition(async () => {
      const result = await runServerAction(
        () => unarchiveClothingItemAction(item.id),
        "Item restored",
      );
      if (!result) {
        return;
      }

      navigateAfterMutation(router, "/wardrobe");
    });
  };

  return (
    <div className="space-y-4">
      <FormPanel>
        <form onSubmit={onSubmit} className="space-y-6">
          <FormSection title="Details">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Blue formal top"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={categoryLocked}
                      items={CLOTHING_CATEGORIES.map((category) => ({
                        value: category,
                        label: CLOTHING_CATEGORY_LABELS[category],
                      }))}
                    >
                      <SelectTrigger
                        className="h-11 w-full bg-background"
                        disabled={categoryLocked}
                      >
                        <SelectValue placeholder="Select category">
                          {(value) => {
                            if (!value) {
                              return "Select category";
                            }

                            return (
                              CLOTHING_CATEGORY_LABELS[value as ClothingCategory] ??
                              value
                            );
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        {CLOTHING_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category} className="py-2.5">
                            {CLOTHING_CATEGORY_LABELS[category]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
                {categoryLocked ? (
                  <p className="text-sm text-muted-foreground">
                    Category is locked because this item appears in outfit history.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  placeholder="e.g. Navy blue"
                  aria-invalid={!!errors.color}
                  {...register("color")}
                />
                {errors.color && (
                  <p className="text-sm text-destructive">{errors.color.message}</p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Notes" description="Optional details to remember later">
            <Textarea
              id="notes"
              rows={3}
              className="min-h-24 resize-none bg-background"
              placeholder="Fit, fabric, or anything to remember"
              {...register("notes")}
            />
          </FormSection>

          <Button type="submit" disabled={isPending} className="h-11 w-full">
            {isPending
              ? "Saving…"
              : mode === "create"
                ? "Add item"
                : "Save changes"}
          </Button>
        </form>
      </FormPanel>

      {mode === "edit" && item && isArchived ? (
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground">Archived item</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This item is hidden from your wardrobe and outfit logging. Restore it to use
            it again.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={isPending}
            onClick={handleUnarchive}
          >
            <ArchiveRestore className="size-3.5" />
            Restore item
          </Button>
        </div>
      ) : null}

      {mode === "edit" && item && !isArchived && isReferenced ? (
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground">Archive item</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This item appears in outfit history and cannot be deleted. Archive it to hide
            from logging and your wardrobe while keeping past outfits intact.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={isPending}
            onClick={() => setShowArchiveDialog(true)}
          >
            <Archive className="size-3.5" />
            Archive item
          </Button>
        </div>
      ) : null}

      {mode === "edit" && item && !isArchived && !isReferenced ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-foreground">Remove from wardrobe</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently delete this item. This cannot be undone.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isPending}
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="size-3.5" />
            Delete item
          </Button>
        </div>
      ) : null}

      {item ? (
        <ClothingDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          itemId={item.id}
          itemName={item.name}
          onDeleted={() => navigateAfterMutation(router, "/wardrobe")}
        />
      ) : null}

      {item ? (
        <ClothingArchiveDialog
          open={showArchiveDialog}
          onOpenChange={setShowArchiveDialog}
          itemId={item.id}
          itemName={item.name}
          onArchived={() => navigateAfterMutation(router, "/wardrobe")}
        />
      ) : null}
    </div>
  );
}
