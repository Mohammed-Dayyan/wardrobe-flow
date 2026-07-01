import { getClothingItems } from "@/features/wardrobe/queries/get-clothing-items";
import { getReferencedClothingItemIds } from "@/features/wardrobe/queries/get-referenced-clothing-item-ids";
import { WardrobeView } from "@/features/wardrobe/components/WardrobeView";

export default async function WardrobePage() {
  const [items, referencedIds] = await Promise.all([
    getClothingItems({ includeArchived: true }),
    getReferencedClothingItemIds(),
  ]);

  return <WardrobeView items={items} referencedIds={[...referencedIds]} />;
}
