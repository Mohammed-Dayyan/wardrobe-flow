import { ClothingForm } from "@/features/wardrobe/components/ClothingForm";

export default function NewClothingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add item</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new piece to your wardrobe
        </p>
      </div>

      <ClothingForm mode="create" />
    </div>
  );
}
