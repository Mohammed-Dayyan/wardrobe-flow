import { SignupForm } from "@/features/auth/components/SignupForm";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthSessionPanel } from "@/features/auth/components/AuthSessionPanel";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/features/profile/queries/get-profile";
import { sanitizeRedirectPath } from "@/lib/navigation/safe-redirect";

interface SignupPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const next = params.next ? sanitizeRedirectPath(params.next) : undefined;
  const user = await getUser();

  if (user) {
    const profile = await getProfile();
    return (
      <AuthCard title="Create your account" description="You're already signed in">
        <AuthSessionPanel profile={profile} email={user.email ?? ""} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      description="Start tracking your wardrobe in seconds"
    >
      <SignupForm next={next} />
    </AuthCard>
  );
}
