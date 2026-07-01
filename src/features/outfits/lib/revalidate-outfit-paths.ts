import { revalidatePath } from "next/cache";

export function revalidateOutfitPaths(date: string) {
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/analytics");
  revalidatePath(`/outfits/${date}`);
  revalidatePath(`/outfits/${date}/entry`);
}
