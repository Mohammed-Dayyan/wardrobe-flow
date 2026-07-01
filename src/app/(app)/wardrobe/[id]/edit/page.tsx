import { ClothingForm } from "@/features/wardrobe/components/ClothingForm";
import { getClothingItem } from "@/features/wardrobe/queries/get-clothing-item";
import { isItemReferenced } from "@/features/wardrobe/queries/is-item-referenced";
import { getUser } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface EditClothingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClothingPage({ params }: EditClothingPageProps) {
  const { id } = await params;
  const user = await getUser();
  const item = await getClothingItem(id);

  if (!item || !user || item.user_id !== user.id) {
    notFound();
  }

  const referenceCheck = await isItemReferenced(id);
  const categoryLocked = referenceCheck.referenced;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit item</h1>
        <p className="mt-1 text-sm text-muted-foreground">{item.name}</p>
      </div>

      <ClothingForm
        mode="edit"
        item={item}
        categoryLocked={categoryLocked}
        isReferenced={referenceCheck.referenced}
      />
    </div>
  );
}
