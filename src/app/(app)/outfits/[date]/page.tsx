import { notFound, redirect } from "next/navigation";
import { DayOutfitsHub } from "@/features/outfits/components/DayOutfitsHub";
import { resolveOutfitRouteDate } from "@/features/outfits/lib/resolve-outfit-route-date";
import { getDayHubContext } from "@/features/outfits/queries/get-log-outfit-context";
import { TimezoneBootstrap } from "@/components/layout/TimezoneBootstrap";

interface OutfitDatePageProps {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ add?: string; edit?: string }>;
}

export default async function OutfitDatePage({
  params,
  searchParams,
}: OutfitDatePageProps) {
  const { date: dateParam } = await params;
  const query = await searchParams;
  const resolved = await resolveOutfitRouteDate(dateParam);

  if ("pending" in resolved) {
    return <TimezoneBootstrap />;
  }

  if ("invalid" in resolved) {
    notFound();
  }

  const { date } = resolved;

  if (query.add === "1") {
    redirect(`/outfits/${date}/entry`);
  }

  if (query.edit) {
    redirect(`/outfits/${date}/entry/${query.edit}`);
  }

  const context = await getDayHubContext(date);

  return (
    <DayOutfitsHub
      date={context.date}
      outfits={context.outfits}
      outfitCount={context.outfitCount}
      canAddOutfit={context.canAddOutfit}
    />
  );
}
