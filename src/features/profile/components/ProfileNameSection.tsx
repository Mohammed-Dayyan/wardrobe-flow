"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileNameForm } from "@/features/profile/components/ProfileNameForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileNameSectionProps {
  displayName: string;
  email?: string;
}

export function ProfileNameSection({ displayName, email }: ProfileNameSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-xs text-muted-foreground">Display name</p>
            <p className="font-medium">{displayName}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
            Edit
          </Button>
        </div>

        {email ? (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium break-all">{email}</p>
          </div>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit display name</DialogTitle>
          </DialogHeader>
          <ProfileNameForm defaultName={displayName} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
