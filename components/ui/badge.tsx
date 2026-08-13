import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Two status components, two emphasis levels — not two ways to do the same
 * thing. `Chip` is the default: solid, mono, high-contrast, for anywhere a
 * status is the primary thing being scanned. `Badge` is the quiet variant:
 * soft tint + dot, for dense tables where a loud chip per row fights the data.
 */

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-white",
  {
    variants: {
      status: {
        success: "bg-success",
        warning: "bg-warning",
        critical: "bg-destructive",
        info: "bg-info",
        neutral: "bg-muted-foreground",
      },
    },
    defaultVariants: { status: "neutral" },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {}

function Chip({ className, status, ...props }: ChipProps) {
  return <span className={cn(chipVariants({ status, className }))} {...props} />;
}

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide",
  {
    variants: {
      status: {
        success: "bg-success-tint text-success",
        warning: "bg-warning-tint text-warning",
        critical: "bg-coral-tint text-destructive",
        neutral: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { status: "neutral" },
  }
);

const dotColor: Record<NonNullable<ChipProps["status"]>, string> = {
  success: "bg-success",
  warning: "bg-warning",
  critical: "bg-destructive",
  info: "bg-info",
  neutral: "bg-muted-foreground",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, status = "neutral", children, ...props }: BadgeProps) {
  // cva's VariantProps types `status` as `T | null | undefined` (null means
  // "explicitly unset"); the default above only covers `undefined`, so
  // `status` is still typed as possibly `null` here -- coalesce before
  // using it as a dotColor key, or tsc fails on this line. Found in
  // fase-4 verification (toeristenbelasting-scraper/review-app).
  const resolvedStatus = status ?? "neutral";
  return (
    <span className={cn(badgeVariants({ status, className }))} {...props}>
      <span className={cn("size-1.5 rounded-full", dotColor[resolvedStatus])} />
      {children}
    </span>
  );
}

export { Chip, Badge, chipVariants, badgeVariants };
