import { Badge } from "@/components/ui/badge";
import type { WearWarning } from "@/features/outfits/lib/derive-wear-warnings";

interface RepetitionWarningProps {
  warnings: WearWarning[];
}

export function RepetitionWarning({ warnings }: RepetitionWarningProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {warnings.map((warning) => (
        <Badge
          key={warning.type}
          variant="outline"
          className="border-amber-300 bg-amber-50 text-amber-800"
        >
          {warning.label}
        </Badge>
      ))}
    </div>
  );
}
