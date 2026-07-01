"use client";

import { useEffect } from "react";
import { isNetworkError } from "@/lib/errors/map-network-error";
import { Button } from "@/components/ui/button";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const description = isNetworkError(error)
    ? "Check your internet connection and try again."
    : "We could not load this page. Try again, or sign out and back in if the problem persists.";

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
