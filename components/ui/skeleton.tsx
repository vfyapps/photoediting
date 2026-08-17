import * as React from "react";
import { cn } from "@/lib/utils";

/** Blok voor route-skeletons (loading.tsx). Spiegelt de vorm van echte content, geen spinner. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-secondary motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Skeleton };
