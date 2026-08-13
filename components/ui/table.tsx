import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Row-bordered, not zebra-striped or shadow-boxed — matches the rest of the
 * system's hairline-over-elevation preference for dense data. Virtualize
 * (e.g. TanStack Virtual) once a table regularly renders more than ~50 rows;
 * that's a deliberate dependency decision, not included here by default.
 */

function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

function TableHeader(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

function TableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-border", className)} {...props} />;
}

function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-3 py-2 text-left font-mono text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-3 py-2.5", className)} {...props} />;
}

/** Use on acco-id / numeric cells so digits line up: <TableCell className={mono}> */
const mono = "font-mono tabular-nums";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, mono };
