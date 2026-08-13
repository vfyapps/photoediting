import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** Say what broke and give a way back — never a dead end. See SKILL.md. */
function ErrorState({
  icon,
  title,
  description,
  onRetry,
  retryLabel = "Opnieuw proberen",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-52 flex-col items-center justify-center gap-3 rounded-md border border-border bg-card p-6 text-center",
        className
      )}
      {...props}
    >
      <div className="text-destructive [&_svg]:size-8">{icon}</div>
      <h4 className="text-sm font-bold text-foreground">{title}</h4>
      {description && <p className="max-w-64 text-[12.5px] text-muted-foreground">{description}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export { ErrorState };
