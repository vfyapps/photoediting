import { PageHeaderSkeleton } from "@/components/ui/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeaderSkeleton />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton className="h-28 w-full" key={i} />
          ))}
        </div>
      </div>

      <Skeleton className="h-48 w-full" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>

      <Skeleton className="h-64 w-full" />
    </div>
  );
}
