"use server";

import { revalidatePath } from "next/cache";
import { createClient, getUser } from "@/lib/supabase/server";
import { profileNameSchema } from "@/features/profile/schemas/profile";
import { mapSupabaseError } from "@/lib/errors/map-supabase-error";
import { AUTH_ERRORS } from "@/lib/auth-errors";

const PROFILE_SAVE_FAILED = "Could not update profile. Please try again.";

export type ProfileActionResult =
  | { success: true }
  | { success: false; error: string };

export async function updateProfileAction(
  formData: FormData,
): Promise<ProfileActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: AUTH_ERRORS.UNAUTHORIZED };
  }

  const parsed = profileNameSchema.safeParse({
    display_name: formData.get("display_name"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.display_name })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfileAction:", error.message);
    return { success: false, error: mapSupabaseError(error.message, PROFILE_SAVE_FAILED) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/", "layout");

  return { success: true };
}
