"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordAction } from "@/features/auth/actions/update-password";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/auth/schemas/change-password";
import {
  notifyError,
  notifyFormValidationError,
  notifySuccess,
} from "@/lib/feedback/toast";
import { runSafeMutation } from "@/lib/feedback/run-server-action";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = handleSubmit(
    (values) => {
      const formData = new FormData();
      formData.set("currentPassword", values.currentPassword);
      formData.set("newPassword", values.newPassword);
      formData.set("confirmPassword", values.confirmPassword);

      startTransition(async () => {
        const result = await runSafeMutation(() => updatePasswordAction({}, formData));
        if (!result) {
          return;
        }
        if (result?.error) {
          notifyError(result.error);
          return;
        }
        if (result?.success) {
          notifySuccess(result.success);
          reset();
        }
      });
    },
    (formErrors) => notifyFormValidationError(formErrors),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <PasswordInput
          id="currentPassword"
          autoComplete="current-password"
          aria-invalid={!!errors.currentPassword}
          {...register("currentPassword")}
        />
        {errors.currentPassword ? (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          aria-invalid={!!errors.newPassword}
          {...register("newPassword")}
        />
        {errors.newPassword ? (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
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

      <Button type="submit" disabled={isPending} className="h-11">
        {isPending ? "Updating…" : "Update password"}
      </Button>

      <p className="text-sm text-muted-foreground">
        <Link href="/forgot-password" className="font-medium text-primary hover:underline">
          Forgot your password?
        </Link>
      </p>
    </form>
  );
}
