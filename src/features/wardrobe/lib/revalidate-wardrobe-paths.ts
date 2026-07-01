import { revalidatePath } from "next/cache";

export function revalidateWardrobePaths(itemId?: string) {
  revalidatePath("/wardrobe");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/analytics");
  revalidatePath("/outfits", "layout");

  if (itemId) {
    revalidatePath(`/wardrobe/${itemId}/edit`);
  }
}
