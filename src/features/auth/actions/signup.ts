"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/features/auth/schemas/auth";
import type { AuthActionState } from "@/features/auth/actions/login";
import { sanitizeRedirectPath } from "@/lib/navigation/safe-redirect";

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await supabase
      .from("profiles")
      .update({ display_name: parsed.data.name })
      .eq("id", data.user.id);
  }

  if (!data.session) {
    return {
      success:
        "Check your email to confirm your account, then sign in to continue.",
    };
  }

  const next = formData.get("next");
  redirect(sanitizeRedirectPath(typeof next === "string" ? next : null));
}
