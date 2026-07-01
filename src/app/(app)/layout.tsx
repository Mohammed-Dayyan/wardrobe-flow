import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/features/profile/queries/get-profile";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();

  return (
    <AppShell profile={profile} email={user.email}>
      {children}
    </AppShell>
  );
}
