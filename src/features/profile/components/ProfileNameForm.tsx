"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileAction } from "@/features/profile/actions/update-profile";
import {
  profileNameSchema,
  type ProfileNameFormValues,
} from "@/features/profile/schemas/profile";
import { notifyFormValidationError } from "@/lib/feedback/toast";
import { runServerAction } from "@/lib/feedback/run-server-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileNameFormProps {
  defaultName: string;
  onSuccess?: () => void;
}

export function ProfileNameForm({ defaultName, onSuccess }: ProfileNameFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileNameFormValues>({
    resolver: zodResolver(profileNameSchema),
    defaultValues: { display_name: defaultName },
  });

  const onSubmit = handleSubmit(
    (values) => {
      const formData = new FormData();
      formData.set("display_name", values.display_name);

      startTransition(async () => {
        const result = await runServerAction(
          () => updateProfileAction(formData),
          "Name updated",
        );
        if (!result) {
          return;
        }
        onSuccess?.();
      });
    },
    (formErrors) => notifyFormValidationError(formErrors),
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display_name">Display name</Label>
        <Input
          id="display_name"
          type="text"
          autoComplete="name"
          aria-invalid={!!errors.display_name}
          {...register("display_name")}
        />
        {errors.display_name ? (
          <p className="text-sm text-destructive">{errors.display_name.message}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save name"}
      </Button>
    </form>
  );
}
