"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { SignOutDialog } from "@/features/auth/components/SignOutDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-10 w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <LogOut className="size-4" />
        Sign out
      </Button>

      <SignOutDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
