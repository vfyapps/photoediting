import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  label?: string;
}

/** Skeleton, not a spinner, for anything wider than a button — see SKILL.md. Respects prefers-reduced-motion. */
function LoadingState({ lines = 3, label = "Gegevens laden…", className, ...props }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "flex min-h-52 flex-col items-center justify-center gap-3 rounded-md border border-border bg-card p-6",
        className
      )}
      {...props}
    >
      <div className="w-full max-w-64 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 animate-pulse rounded-full bg-secondary motion-reduce:animate-none"
            style={{ width: `${75 - i * 12}%` }}
          />
        ))}
      </div>
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
    </div>
  );
}

export { LoadingState };
