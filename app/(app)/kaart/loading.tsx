import { PageHeaderSkeleton } from "@/components/ui/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeaderSkeleton />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-[70vh] min-h-[480px] w-full rounded-md" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton className="h-6 w-full" key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
