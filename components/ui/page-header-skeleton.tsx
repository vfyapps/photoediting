import { Skeleton } from "@/components/ui/skeleton";

/** Spiegelt PageHeader (eyebrow + titel + beschrijving) voor route-skeletons. */
function PageHeaderSkeleton() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
    </div>
  );
}

export { PageHeaderSkeleton };
