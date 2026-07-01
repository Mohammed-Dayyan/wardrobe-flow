import { z } from "zod";

export const profileNameSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be 80 characters or less"),
});

export type ProfileNameFormValues = z.infer<typeof profileNameSchema>;
