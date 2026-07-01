import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthSessionPanel } from "@/features/auth/components/AuthSessionPanel";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/features/profile/queries/get-profile";
import { sanitizeRedirectPath } from "@/lib/navigation/safe-redirect";

interface LoginPageProps {
  searchParams: Promise<{ code?: string; error?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next ? sanitizeRedirectPath(params.next) : undefined;

  if (params.code) {
    redirect(
      `/auth/callback?code=${encodeURIComponent(params.code)}&next=/auth/reset-password`,
    );
  }

  const user = await getUser();

  if (user) {
    const profile = await getProfile();
    return (
      <AuthCard title="Welcome back" description="You're already signed in">
        <AuthSessionPanel profile={profile} email={user.email ?? ""} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to track your wardrobe and outfits"
    >
      <LoginForm authError={params.error === "auth"} next={next} />
    </AuthCard>
  );
}
