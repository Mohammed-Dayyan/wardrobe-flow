"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { DayType } from "@/types/database";
import type { ClothingItem } from "@/types/database";
import type { ClothingCategory } from "@/lib/validations/categories";
import {
  createOutfitFormSchema,
  type OutfitFormValues,
} from "@/features/outfits/schemas/outfit";
import { getTodayISO } from "@/lib/utils/date";
import { createOutfitAction } from "@/features/outfits/actions/create-outfit";
import { updateOutfitAction } from "@/features/outfits/actions/update-outfit";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";
import {
  buildSlotFormDefaults,
  slotToFormField,
} from "@/features/outfits/lib/outfit-slot-values";
import type { WearHintsMap } from "@/features/outfits/queries/get-wear-hints";
import { DayTypeSelector } from "@/features/outfits/components/DayTypeSelector";
import { OutfitItemsSection } from "@/features/outfits/components/OutfitItemsSection";
import { OutfitDeleteDialog } from "@/features/outfits/components/OutfitDeleteDialog";
import { FormPanel, FormSection } from "@/components/layout/FormPanel";
import { notifyFormValidationError } from "@/lib/feedback/toast";
import { runServerAction } from "@/lib/feedback/run-server-action";
import { navigateAfterMutation } from "@/lib/navigation/client-navigate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface OutfitEntryFormProps {
  date: string;
  mode: "create" | "edit";
  outfit?: OutfitWithItems | null;
  pickerItems: Record<ClothingCategory, ClothingItem[]>;
  wearHints: WearHintsMap;
}

export function OutfitEntryForm({
  date,
  mode,
  outfit,
  pickerItems,
  wearHints,
}: OutfitEntryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<OutfitFormValues>({
    resolver: zodResolver(createOutfitFormSchema(getTodayISO())),
    defaultValues: {
      ...buildSlotFormDefaults(date, outfit),
      outfit_id: outfit?.id ?? "",
    },
  });

  const [dayType, topId, pantsId, jacketId, shoesId] = useWatch({
    control,
    name: ["day_type", "top_id", "pants_id", "jacket_id", "shoes_id"],
  }) as [DayType, string, string, string, string];

  const handleItemChange = (role: ClothingCategory, value: string) => {
    setValue(slotToFormField(role), value, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(
    (values) => {
      const formData = new FormData();
      formData.set("date", values.date);
      formData.set("day_type", values.day_type);
      formData.set("notes", values.notes ?? "");
      formData.set("top_id", values.top_id ?? "");
      formData.set("pants_id", values.pants_id ?? "");
      formData.set("jacket_id", values.jacket_id ?? "");
      formData.set("shoes_id", values.shoes_id ?? "");

      if (mode === "edit" && outfit?.id) {
        formData.set("outfit_id", outfit.id);
      }

      startTransition(async () => {
        const successMessage =
          mode === "create" ? "Outfit logged" : "Outfit updated";
        const result = await runServerAction(
          () =>
            mode === "create"
              ? createOutfitAction(formData, date)
              : updateOutfitAction(formData, date),
          successMessage,
        );
        if (!result) {
          return;
        }

        navigateAfterMutation(router, `/outfits/${date}`);
      });
    },
    (formErrors) => notifyFormValidationError(formErrors),
  );

  const handleDeleted = () => {
    navigateAfterMutation(router, `/outfits/${date}`);
  };

  return (
    <>
      <FormPanel>
        <form onSubmit={onSubmit} className="space-y-6">
          <input type="hidden" {...register("date")} />
          {mode === "edit" && outfit?.id ? (
            <input type="hidden" {...register("outfit_id")} />
          ) : null}

          <FormSection title="Day type" description="What kind of day was it?">
            <Controller
              name="day_type"
              control={control}
              render={({ field }) => (
                <DayTypeSelector
                  value={field.value as DayType}
                  onChange={field.onChange}
                />
              )}
            />
          </FormSection>

          <FormSection>
            <OutfitItemsSection
              dayType={dayType}
              itemsByCategory={pickerItems}
              wearHints={wearHints}
              values={{
                top_id: topId ?? "",
                pants_id: pantsId ?? "",
                jacket_id: jacketId ?? "",
                shoes_id: shoesId ?? "",
              }}
              onChange={handleItemChange}
              errors={{
                top_id: errors.top_id?.message,
                pants_id: errors.pants_id?.message,
                jacket_id: errors.jacket_id?.message,
                shoes_id: errors.shoes_id?.message,
              }}
            />
          </FormSection>

          <FormSection title="Notes" description="Anything else to remember?">
            <Textarea
              id="notes"
              rows={3}
              className="min-h-24 resize-none bg-background"
              placeholder="Optional notes for this outfit"
              {...register("notes")}
            />
          </FormSection>

          <Button type="submit" disabled={isPending} className="h-11 w-full">
            {isPending ? "Saving…" : mode === "create" ? "Save outfit" : "Save changes"}
          </Button>

          {mode === "edit" ? (
            <Button
              type="button"
              variant="destructive"
              className="h-11 w-full"
              disabled={isPending}
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete outfit
            </Button>
          ) : null}
        </form>
      </FormPanel>

      {mode === "edit" && outfit?.id ? (
        <OutfitDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          outfitId={outfit.id}
          onDeleted={handleDeleted}
        />
      ) : null}
    </>
  );
}
