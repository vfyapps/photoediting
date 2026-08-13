import * as React from "react";
import { cn } from "@/lib/utils";

/** Filter/search/action row above a table or list. Reflect its state in the URL — see SKILL.md. */
function Toolbar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 py-3",
        className
      )}
      {...props}
    />
  );
}

function ToolbarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)} {...props} />;
}

export { Toolbar, ToolbarGroup };
