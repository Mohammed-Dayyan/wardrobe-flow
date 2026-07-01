import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { AuthCard } from "@/features/auth/components/AuthCard";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset password"
      description="We'll email you a link to reset your password"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
