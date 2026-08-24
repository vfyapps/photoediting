import * as React from "react";
import { avatarColorVar } from "@/lib/avatar-color";
import { cn } from "@/lib/utils";

type AccoMarkProps = {
  accoId: string;
  size?: "sm" | "md";
  className?: string;
};

/**
 * Vervangt de visuele identiteit van een foto (DESIGN-V5.md §2): het acco-id
 * krijgt een stabiele kleurspine via dezelfde hash als avatarColorVar
 * (lib/avatar-color.ts, al gebruikt voor editor-avatars) — zo herken je een
 * woning aan zijn kleur over alle schermen heen, zoals een thumbnail dat zou
 * doen, zonder dat er ooit een foto in de app hoeft te staan.
 */
function AccoMark({ accoId, size = "md", className }: AccoMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border-l-[3px] pl-1.5 font-mono font-semibold tabular-nums",
        size === "sm" ? "text-xs" : "text-sm",
        className,
      )}
      style={{ borderColor: avatarColorVar(accoId) }}
    >
      {accoId}
    </span>
  );
}

export { AccoMark };
