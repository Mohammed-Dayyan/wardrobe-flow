import { getClothingItems } from "@/features/wardrobe/queries/get-clothing-items";
import { getReferencedClothingItemIds } from "@/features/wardrobe/queries/get-referenced-clothing-item-ids";
import { getItemWearHistory } from "@/features/wardrobe/queries/get-item-wear-history";
import { parseWardrobeParams } from "@/features/wardrobe/lib/parse-wardrobe-params";
import { WardrobeView } from "@/features/wardrobe/components/WardrobeView";
import { ItemWearHistorySheet } from "@/features/wardrobe/components/ItemWearHistorySheet";

interface WardrobePageProps {
  searchParams: Promise<{ item?: string }>;
}

export default async function WardrobePage({ searchParams }: WardrobePageProps) {
  const params = await searchParams;
  const { itemId } = parseWardrobeParams(params);

  const [items, referencedIds, wearHistory] = await Promise.all([
    getClothingItems({ includeArchived: true }),
    getReferencedClothingItemIds(),
    itemId ? getItemWearHistory(itemId) : Promise.resolve(null),
  ]);

  return (
    <>
      <WardrobeView items={items} referencedIds={[...referencedIds]} />
      {wearHistory ? <ItemWearHistorySheet history={wearHistory} /> : null}
    </>
  );
}
