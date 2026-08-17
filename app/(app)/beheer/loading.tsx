import { PageHeaderSkeleton } from "@/components/ui/page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * BeheerLayout (layout.tsx) is zelf async — dit skelet dekt dus ook de kop en
 * tabbladen, die pas na de gebruikerscheck echt renderen.
 */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <div className="flex gap-1 border-b border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton className="mb-2 h-8 w-24 rounded-md" key={i} />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton className="h-11 w-full" key={i} />
        ))}
      </div>
    </div>
  );
}
