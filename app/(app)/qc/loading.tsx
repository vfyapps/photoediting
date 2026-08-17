import { PageHeaderSkeleton } from "@/components/ui/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeaderSkeleton />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-1 rounded-md border border-border bg-card p-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton className="h-12 w-full" key={i} />
          ))}
        </div>
        <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>
    </div>
  );
}
