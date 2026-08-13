import { Download } from "lucide-react";

export function ExportLink({ view, label }: { view: string; label: string }) {
  return (
    <a
      className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-[transform,box-shadow] duration-fast ease-standard hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      href={`/dashboard/export?view=${view}`}
    >
      <Download aria-hidden="true" className="size-3.5" />
      {label} (CSV)
    </a>
  );
}
