import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { UpdatePasswordForm } from "@/features/auth/components/UpdatePasswordForm";
import { Button } from "@/components/ui/button";

export default async function ResetPasswordPage() {
  const user = await getUser();

  if (!user) {
    return (
      <AuthCard
        title="Reset password"
        description="Your reset link may have expired"
      >
        <p className="text-sm text-muted-foreground">
          Request a new link to set your password.
        </p>
        <Button className="mt-4 h-11 w-full" nativeButton={false} render={<Link href="/forgot-password" />}>
          Forgot password
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a new password" description="Choose a new password for your account">
      <UpdatePasswordForm />
    </AuthCard>
  );
}
