import { formatFriendlyDateWithYear } from "@/lib/utils/date";

interface LogOutfitHeaderProps {
  mode: "create" | "edit";
  subtitle?: string;
}

export function LogOutfitHeader({ mode, subtitle }: LogOutfitHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "edit" ? "Edit outfit" : "Log outfit"}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function logOutfitDateSubtitle(date: string): string {
  return formatFriendlyDateWithYear(date);
}
