import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

function PageHeader({ eyebrow, title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-2">
        {eyebrow && (
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-vfy-teal-ink">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl">{title}</h1>
        {description && <p className="max-w-prose text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export { PageHeader };
