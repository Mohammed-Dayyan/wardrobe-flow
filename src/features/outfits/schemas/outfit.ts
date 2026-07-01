import { z } from "zod";
import { DAY_TYPES, requiresOfficeOutfit } from "@/lib/validations/day-types";

export function createOutfitFormSchema(today: string) {
  return z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
      day_type: z.enum(DAY_TYPES),
      notes: z
        .string()
        .trim()
        .max(500, "Notes must be 500 characters or less")
        .optional()
        .or(z.literal("")),
      outfit_id: z.string().uuid().optional().or(z.literal("")),
      top_id: z.string().uuid().optional().or(z.literal("")),
      pants_id: z.string().uuid().optional().or(z.literal("")),
      jacket_id: z.string().uuid().optional().or(z.literal("")),
      shoes_id: z.string().uuid().optional().or(z.literal("")),
    })
    .superRefine((data, ctx) => {
      if (data.date > today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Date cannot be in the future",
          path: ["date"],
        });
      }

      if (!requiresOfficeOutfit(data.day_type)) {
        return;
      }

      if (!data.top_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a top",
          path: ["top_id"],
        });
      }
      if (!data.pants_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select pants",
          path: ["pants_id"],
        });
      }
    });
}

export type OutfitFormValues = z.infer<ReturnType<typeof createOutfitFormSchema>>;
