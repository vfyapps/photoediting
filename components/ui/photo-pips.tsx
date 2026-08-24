import * as React from "react";
import { cn } from "@/lib/utils";

type PhotoPipsProps = {
  /** Fotonummers, in de volgorde waarin ze getoond moeten worden. */
  photoNumbers: number[];
  done: Set<number>;
  /** "pips" = klein, decoratief (bordkaart/tabel). "chips" = groot, klikbaar,
   *  genummerd (opdrachtdetail/QC). */
  variant?: "pips" | "chips";
  onSelect?: (photoNumber: number) => void;
  selected?: number | null;
  className?: string;
};

/**
 * Vervangt de voortgangsbalk/before-after uit de mockups (DESIGN-V5.md §2):
 * edit_items.photo_number + done wordt zichtbaar als een rij vierkantjes.
 * "pips" is puur decoratief met een tekstueel X/Y ernaast voor
 * schermlezers — kleur/vorm is nooit de enige drager van de voortgang.
 */
function PhotoPips({ photoNumbers, done, variant = "pips", onSelect, selected, className }: PhotoPipsProps) {
  const doneCount = photoNumbers.filter((n) => done.has(n)).length;

  if (variant === "chips") {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)} role={onSelect ? "listbox" : undefined}>
        {photoNumbers.map((n) => {
          const isDone = done.has(n);
          const isSelected = selected === n;
          const Tag = onSelect ? "button" : "div";
          return (
            <Tag
              aria-label={`Foto #${n}${isDone ? ", afgevinkt" : ""}`}
              aria-pressed={onSelect ? isSelected : undefined}
              className={cn(
                "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 font-mono text-xs font-semibold tabular-nums transition-[transform,box-shadow] duration-fast ease-standard",
                onSelect && "cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                isSelected
                  ? "border-primary bg-accent text-primary"
                  : isDone
                    ? "border-success-tint bg-success-tint text-success"
                    : "border-border bg-card text-muted-foreground",
              )}
              key={n}
              onClick={onSelect ? () => onSelect(n) : undefined}
              role={onSelect ? "option" : undefined}
              type={onSelect ? "button" : undefined}
            >
              #{n}
            </Tag>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div aria-hidden="true" className="flex flex-wrap gap-1">
        {photoNumbers.map((n) => (
          <span
            className={cn(
              "size-2.5 rounded-[2px]",
              done.has(n) ? "bg-v5-green" : "border border-muted-foreground/40",
            )}
            key={n}
          />
        ))}
      </div>
      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
        {doneCount}/{photoNumbers.length}
      </span>
    </div>
  );
}

export { PhotoPips };
