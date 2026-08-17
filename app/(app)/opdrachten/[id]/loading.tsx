import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="mb-3 h-3.5 w-32" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      <Skeleton className="h-9 w-44 rounded-md" />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr_280px]">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton className="h-5 w-full" key={i} />
          ))}
          <Skeleton className="mt-2 h-9 w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton className="h-14 w-full" key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
