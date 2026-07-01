import Link from "next/link";
import { ChangePasswordForm } from "@/features/settings/components/ChangePasswordForm";

interface PasswordSectionProps {
  canChangePassword: boolean;
}

export function PasswordSection({ canChangePassword }: PasswordSectionProps) {
  if (canChangePassword) {
    return <ChangePasswordForm />;
  }

  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p>
        Your account uses a social or magic-link sign-in provider. Password changes
        are not available here.
      </p>
      <p>
        To set a password for email sign-in, use{" "}
        <Link href="/forgot-password" className="font-medium text-primary hover:underline">
          forgot password
        </Link>{" "}
        with your account email.
      </p>
    </div>
  );
}
