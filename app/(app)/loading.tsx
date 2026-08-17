import { PageHeaderSkeleton } from "@/components/ui/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const columns = ["Nieuw", "In behandeling", "QC", "Afgekeurd"];

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeaderSkeleton />

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton className="h-8 w-32 rounded-md" key={i} />
        ))}
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(5,minmax(130px,1fr))]">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton className="h-9 w-full" key={i} />
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {columns.map((label) => (
          <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-2" key={label}>
            <div className="flex items-center justify-between px-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-6" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton className="h-20 w-full" key={i} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
