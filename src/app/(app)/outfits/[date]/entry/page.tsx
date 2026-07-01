import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OutfitEntryForm } from "@/features/outfits/components/OutfitEntryForm";
import { resolveOutfitRouteDate } from "@/features/outfits/lib/resolve-outfit-route-date";
import { getCreateOutfitContext } from "@/features/outfits/queries/get-log-outfit-context";
import { formatFriendlyDate } from "@/lib/utils/date";
import { TimezoneBootstrap } from "@/components/layout/TimezoneBootstrap";
import { Button } from "@/components/ui/button";

interface OutfitEntryPageProps {
  params: Promise<{ date: string }>;
}

export default async function OutfitEntryPage({ params }: OutfitEntryPageProps) {
  const { date: dateParam } = await params;
  const resolved = await resolveOutfitRouteDate(dateParam);

  if ("pending" in resolved) {
    return <TimezoneBootstrap />;
  }

  if ("invalid" in resolved) {
    notFound();
  }

  const { date } = resolved;
  const context = await getCreateOutfitContext(date);

  if (!context.canAddOutfit) {
    redirect(`/outfits/${date}`);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 px-2"
          nativeButton={false}
          render={<Link href={`/outfits/${date}`} />}
        >
          <ChevronLeft className="size-4" />
          Back to day
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add outfit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatFriendlyDate(date)}
          </p>
        </div>
      </div>

      <OutfitEntryForm
        key={`create-${date}`}
        date={date}
        mode="create"
        pickerItems={context.pickerItems}
        wearHints={context.wearHints}
      />
    </div>
  );
}
