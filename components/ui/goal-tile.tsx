import * as React from "react";
import { getGoalVisual } from "@/lib/goal-visuals";
import { cn } from "@/lib/utils";

type GoalTileGoal = { code: string; label: string };

type GoalTileProps = {
  /** "strip" = bordkaart-kop (kan meerdere doelen tonen, met een +N-rest).
   *  "panel" = één doel, groot, met eigen inhoud (fotonummers etc.).
   *  "tile"  = QC-review-canvas, extra groot, met eigen inhoud. */
  variant: "strip" | "panel" | "tile";
  goals: GoalTileGoal[];
  /** Alleen relevant voor panel/tile: inhoud onder het label (bijv. PhotoPips). */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Vervangt de thumbnail uit de mockups (DESIGN-V5.md §2): geen foto, maar het
 * bewerkdoel zelf als beeld — vaste kleur + glyph per goal_code, dus
 * herkenbaar over alle schermen heen. Informatiever dan een kamerfoto: die
 * vertelt niet dat het om "bed opmaken" gaat, dit glyph wel.
 */
function GoalTile({ variant, goals, children, className }: GoalTileProps) {
  if (goals.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md bg-muted text-xs text-muted-foreground",
          variant === "strip" ? "h-11" : "min-h-24",
          className,
        )}
      >
        Geen doel gekoppeld
      </div>
    );
  }

  if (variant === "strip") {
    const shown = goals.slice(0, 2);
    const extra = goals.length - shown.length;
    // Meerdere doelen: gelijk verdeelde banden naast elkaar. Een lichte tint
    // (12% alpha) i.p.v. een volle band, met het icoon+label in de normale
    // voorgrondkleur — een volle band met witte tekst faalt op de lichtere
    // chart-tinten (amber/roze halen maar 2.2-2.7:1 wit-op-kleur, zie
    // globals.css' bestaande waarschuwing bij --chart-*). Het icoon draagt
    // de kleur zelf, niet zijn achtergrond.
    return (
      <div className={cn("flex h-11 overflow-hidden rounded-t-md", className)}>
        {shown.map((goal) => {
          const { icon: Icon, chartSlot } = getGoalVisual(goal.code);
          return (
            <div
              className="flex flex-1 items-center gap-1.5 px-2.5"
              key={goal.code}
              style={{ backgroundColor: `color-mix(in srgb, var(--chart-${chartSlot}) 14%, var(--card))` }}
              title={goal.label}
            >
              <Icon
                aria-hidden="true"
                className="size-4 shrink-0"
                style={{ color: `var(--chart-${chartSlot})` }}
              />
              <span className="truncate text-xs font-medium text-foreground">{goal.label}</span>
            </div>
          );
        })}
        {extra > 0 ? (
          <div className="flex shrink-0 items-center bg-muted px-2 text-xs font-semibold text-muted-foreground">
            +{extra}
          </div>
        ) : null}
      </div>
    );
  }

  // panel / tile: één kaart per doel, aanroeper mapt de lijst zelf zodat elk
  // doel zijn eigen `children` (fotonummers) krijgt — hier dus altijd 1 goal.
  const goal = goals[0];
  const { icon: Icon, chartSlot } = getGoalVisual(goal.code);
  const big = variant === "tile";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-v5-card",
        big && "p-6",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {/* Kleurring, neutrale vulling, gekleurd icoon — zelfde patroon als
            avatarColorVar() elders (lib/avatar-color.ts): de chart-kleur zit
            op de rand en het icoon, nooit als vlakvulling met tekst erop. */}
        <span
          className={cn(
            "grid shrink-0 place-items-center rounded-full border-2 bg-muted",
            big ? "size-12" : "size-9",
          )}
          style={{ borderColor: `var(--chart-${chartSlot})` }}
        >
          <Icon
            aria-hidden="true"
            className={big ? "size-6" : "size-5"}
            style={{ color: `var(--chart-${chartSlot})` }}
          />
        </span>
        <h3 className={cn("font-display font-bold", big ? "text-lg" : "text-sm")}>{goal.label}</h3>
      </div>
      {children}
    </div>
  );
}

export { GoalTile };
