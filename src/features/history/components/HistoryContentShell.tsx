import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HistoryContentShellProps {
  children: ReactNode;
  className?: string;
}

export function HistoryContentShell({
  children,
  className,
}: HistoryContentShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-xl space-y-6", className)}>
      {children}
    </div>
  );
}
