import { getUser } from "@/lib/supabase/server";
import { getProfile } from "@/features/profile/queries/get-profile";
import { getDisplayName } from "@/features/profile/lib/display-name";
import { hasPasswordIdentity } from "@/features/auth/lib/has-password-identity";
import { ProfileNameSection } from "@/features/profile/components/ProfileNameSection";
import { PasswordSection } from "@/features/settings/components/PasswordSection";
import { SignOutButton } from "@/features/auth/components/SignOutButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);
  const displayName = getDisplayName(profile);
  const canChangePassword = user ? hasPasswordIdentity(user) : false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account
        </p>
      </div>

      <Card className="shadow-sm" size="sm">
        <CardHeader className="pb-0">
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <ProfileNameSection displayName={displayName} email={user?.email} />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            {canChangePassword
              ? "Update your password"
              : "Password managed by your sign-in provider"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordSection canChangePassword={canChangePassword} />
        </CardContent>
      </Card>

      <Card className="shadow-sm" size="sm">
        <CardHeader className="pb-0">
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
