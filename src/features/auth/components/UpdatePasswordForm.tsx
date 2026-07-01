"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import {
  notifyError,
  notifyFormValidationError,
  notifySuccess,
} from "@/lib/feedback/toast";
import { runSafeMutation } from "@/lib/feedback/run-server-action";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { navigateAfterMutation } from "@/lib/navigation/client-navigate";

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = handleSubmit(
    (values) => {
      startTransition(async () => {
        const result = await runSafeMutation(async () => {
          const supabase = createClient();
          const { error } = await supabase.auth.updateUser({
            password: values.password,
          });
          return { error };
        });

        if (!result) {
          return;
        }

        if (result.error) {
          notifyError(result.error.message);
          return;
        }

        notifySuccess("Password updated");
        navigateAfterMutation(router, "/dashboard");
      });
    },
    (formErrors) => notifyFormValidationError(formErrors),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isPending} className="h-11 w-full">
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
