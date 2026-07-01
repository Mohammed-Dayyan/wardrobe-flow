import { z } from "zod";
import { CLOTHING_CATEGORIES } from "@/lib/validations/categories";

export const clothingItemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  category: z.enum(CLOTHING_CATEGORIES, {
    message: "Please select a category",
  }),
  color: z
    .string()
    .trim()
    .min(1, "Color is required")
    .max(50, "Color must be 50 characters or less"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or less")
    .optional()
    .or(z.literal("")),
});

export type ClothingItemFormValues = z.infer<typeof clothingItemFormSchema>;
