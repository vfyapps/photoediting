import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * V5 "Studio" laat de eyebrow los (BUILDPLAN-V5 §WP1.3) — de titel draagt
   * de hiërarchie nu alleen. De prop blijft geaccepteerd zodat de ~15
   * call-sites die hem nog doorgeven niet allemaal hoeven te wijzigen; hij
   * wordt gewoon niet meer gerenderd.
   */
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  /** Weergave-tabs (bijv. Bord/Tabel) op dezelfde regel als de titel. */
  tabs?: React.ReactNode;
  actions?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- eyebrow moet uit ...props blijven (geen geldig DOM-attribuut), maar wordt in V5 niet meer gerenderd
function PageHeader({ eyebrow, title, description, tabs, actions, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-display font-extrabold tracking-tight">{title}</h1>
          {tabs}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {description && <p className="max-w-prose text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

export { PageHeader };
