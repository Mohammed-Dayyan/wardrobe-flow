import { Skeleton } from "@/components/ui/skeleton";

export default function OutfitEntryLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-28" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="space-y-4 rounded-xl border p-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}
