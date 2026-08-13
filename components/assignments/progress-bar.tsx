import { cn } from "@/lib/utils";

export function ProgressBar({
  done,
  total,
  className,
}: {
  done: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        aria-label={`${done} van ${total} foto's af`}
        aria-valuemax={total}
        aria-valuemin={0}
        aria-valuenow={done}
        className="h-1.5 min-w-12 flex-1 overflow-hidden rounded-full bg-progress-track"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-progress-fill transition-[width] duration-base ease-standard motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
        {done} van {total}
      </span>
    </div>
  );
}
