import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="min-h-24 rounded-xl" />
        <Skeleton className="min-h-24 rounded-xl" />
        <Skeleton className="min-h-24 rounded-xl" />
        <Skeleton className="min-h-24 rounded-xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  );
}
