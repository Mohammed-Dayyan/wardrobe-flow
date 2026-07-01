"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { DAY_TYPE_CONFIG } from "@/lib/validations/day-types";
import type { OutfitWithItems } from "@/features/outfits/queries/get-outfit-by-date";
import { OutfitDeleteDialog } from "@/features/outfits/components/OutfitDeleteDialog";
import { OutfitItemsPreview } from "@/features/outfits/components/OutfitItemsPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OutfitLogCardProps {
  outfit: OutfitWithItems;
  index: number;
  date: string;
}

export function OutfitLogCard({ outfit, index, date }: OutfitLogCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const config = DAY_TYPE_CONFIG[outfit.day_type];

  return (
    <>
      <Card className="border-border/60 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Outfit {index + 1}
              </p>
              <Badge className={config.badgeClass}>{config.label}</Badge>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href={`/outfits/${date}/entry/${outfit.id}`} />}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                aria-label="Delete outfit"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>

          <OutfitItemsPreview
            outfit={outfit}
            variant="muted"
            emptyMessage="No items logged for this outfit."
          />

          {outfit.notes ? (
            <p className="text-sm text-muted-foreground">{outfit.notes}</p>
          ) : null}
        </CardContent>
      </Card>

      <OutfitDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        outfitId={outfit.id}
        onDeleted={() => router.refresh()}
      />
    </>
  );
}
