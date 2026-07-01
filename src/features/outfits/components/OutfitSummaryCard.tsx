import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import { hasOutfitItems } from "@/features/outfits/lib/format-outfit-summary";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";
import { formatFriendlyDateWithYear } from "@/lib/utils/date";
import { CLOTHING_CATEGORY_LABELS } from "@/lib/validations/categories";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OutfitSummaryCardProps {
  outfit: OutfitWithItems;
}

export function OutfitSummaryCard({ outfit }: OutfitSummaryCardProps) {
  const config = DAY_TYPE_CONFIG[outfit.day_type];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{formatFriendlyDateWithYear(outfit.date)}</CardTitle>
          <Badge className={config.badgeClass}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasOutfitItems(outfit.outfit_items) ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {outfit.outfit_items.map((item) => (
              <li key={item.role}>
                <span className="text-foreground">{CLOTHING_CATEGORY_LABELS[item.role]}:</span>{" "}
                {item.clothing_items.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No outfit items logged.</p>
        )}
        {outfit.notes ? (
          <p className="text-sm text-muted-foreground">{outfit.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
