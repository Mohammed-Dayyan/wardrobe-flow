"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "@/features/auth/actions/login";
import {
  notifyError,
  notifyFormValidationError,
} from "@/lib/feedback/toast";
import { runSafeMutation } from "@/lib/feedback/run-server-action";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { buildAuthHref } from "@/lib/navigation/build-auth-href";

interface LoginFormProps {
  authError?: boolean;
  next?: string;
}

export function LoginForm({ authError, next }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(
    (values) => {
      const formData = new FormData();
      formData.set("email", values.email);
      formData.set("password", values.password);
      if (next) {
        formData.set("next", next);
      }

      startTransition(async () => {
        const result = await runSafeMutation(() => loginAction({}, formData));
        if (!result) {
          return;
        }
        if (result?.error) {
          notifyError(result.error);
        }
      });
    },
    (errors) => notifyFormValidationError(errors),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {authError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          Sign-in link expired or invalid. Please sign in with your email and
          password.
        </div>
      ) : null}

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

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>

      <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
        <Link
          href="/forgot-password"
          className="text-primary hover:underline"
        >
          Forgot password?
        </Link>
        <p>
          No account?{" "}
          <Link
            href={buildAuthHref("/signup", next)}
            className="text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
}
