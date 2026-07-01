"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { forgotPasswordAction } from "@/features/auth/actions/forgot-password";
import {
  notifyError,
  notifyFormValidationError,
  notifySuccess,
} from "@/lib/feedback/toast";
import { runSafeMutation } from "@/lib/feedback/run-server-action";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(
    (values) => {
      const formData = new FormData();
      formData.set("email", values.email);

      startTransition(async () => {
        const result = await runSafeMutation(() => forgotPasswordAction({}, formData));
        if (!result) {
          return;
        }
        if (result?.error) {
          notifyError(result.error);
        } else if (result?.success) {
          notifySuccess(result.success);
        }
      });
    },
    (errors) => notifyFormValidationError(errors),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
