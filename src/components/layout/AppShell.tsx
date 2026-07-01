import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { TimezoneSync } from "@/components/layout/TimezoneSync";
import type { Profile } from "@/types/database";

interface AppShellProps {
  children: React.ReactNode;
  profile: Profile | null;
  email?: string;
}

export function AppShell({ children, profile, email }: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-1">
      <TimezoneSync />
      <Sidebar profile={profile} email={email} />
      <div className="flex min-h-full flex-1 flex-col">
        <TopBar />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-24 pt-4 md:max-w-3xl md:pb-8 md:pt-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
