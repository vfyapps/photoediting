import {
  Bed,
  Cloud,
  Eraser,
  Leaf,
  Snowflake,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";

/**
 * V5 "Studio" beeldloos systeem (DESIGN-V5.md §2): geen thumbnails, dus het
 * bewerkdoel draagt de visuele identiteit van een kaart/tegel via een vast
 * icoon + een vaste chart-slot. "Vast" is het punt — nooit hashen, anders
 * verschuift de kleur van een doel per render/sessie.
 *
 * Bewust op `goal_code` gebaseerd, niet op de `editing_goals.icon`-kolom in
 * de database: dat zou vereisen dat elke query die GoalOption oplevert (een
 * stuk of tien call-sites, van het bord tot de kaart) ook `icon` selecteert.
 * De zeven codes hier komen letterlijk uit db/02_seed_reference.sql — als
 * daar een nieuwe goal bijkomt, hoort die hier een regel bij te krijgen.
 */

type GoalVisual = { icon: LucideIcon; chartSlot: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 };

const goalVisuals: Record<string, GoalVisual> = {
  summer_to_winter: { icon: Snowflake, chartSlot: 1 },
  improve_lighting: { icon: Sun, chartSlot: 4 },
  improve_ambiance: { icon: Sparkles, chartSlot: 5 },
  replace_sky: { icon: Cloud, chartSlot: 7 },
  make_beds: { icon: Bed, chartSlot: 3 },
  remove_object: { icon: Eraser, chartSlot: 8 },
  improve_summer: { icon: Leaf, chartSlot: 6 },
};

// Fallback voor een goal die later wordt toegevoegd zonder eigen regel hier
// (bijv. via Beheer > Referentiedata) — geen crash, gewoon een neutraal
// glyph in slot 2 tot iemand deze mapping bijwerkt.
const fallbackVisual: GoalVisual = { icon: Sparkles, chartSlot: 2 };

export function getGoalVisual(goalCode: string): GoalVisual {
  return goalVisuals[goalCode] ?? fallbackVisual;
}

export function goalChartVar(goalCode: string): string {
  return `var(--chart-${getGoalVisual(goalCode).chartSlot})`;
}
