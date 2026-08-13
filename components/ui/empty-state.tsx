import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/** Every list/table screen needs one of these for its zero-data state — see SKILL.md. */
function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-52 flex-col items-center justify-center gap-3 rounded-md border border-border bg-card p-6 text-center",
        className
      )}
      {...props}
    >
      <div className="text-muted-foreground [&_svg]:size-8">{icon}</div>
      <h4 className="text-sm font-bold text-foreground">{title}</h4>
      {description && <p className="max-w-64 text-[12.5px] text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export { EmptyState };
