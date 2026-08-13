"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { toggleEditItemDone } from "@/app/actions";
import type { EditItem } from "@/lib/assignments";
import { cn } from "@/lib/utils";

export function EditItemsChecklist({
  items,
  goalLabels,
}: {
  items: EditItem[];
  goalLabels: Map<string, string>;
}) {
  const [optimisticItems, setOptimisticItem] = useOptimistic(
    items,
    (state, updated: EditItem) => state.map((item) => (item.id === updated.id ? updated : item)),
  );
  const [, startTransition] = useTransition();

  function toggle(item: EditItem, done: boolean) {
    startTransition(async () => {
      setOptimisticItem({ ...item, done });
      const result = await toggleEditItemDone(item.id, done);
      if (!result.ok) toast.error(result.message);
    });
  }

  const sorted = [...optimisticItems].sort((a, b) => a.photoNumber - b.photoNumber);

  if (sorted.length === 0) {
    return (
      <p className="px-3 py-4 text-xs text-muted-foreground">
        Nog geen foto&apos;s toegevoegd aan deze opdracht.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {sorted.map((item) => (
        <li className="flex items-center gap-3 px-3 py-2 text-sm" key={item.id}>
          <input
            aria-label={`Foto ${item.photoNumber} (${goalLabels.get(item.goalCode) ?? item.goalCode}) afvinken`}
            checked={item.done}
            className="size-3.5 shrink-0 rounded-sm border-input accent-primary"
            onChange={(event) => toggle(item, event.target.checked)}
            type="checkbox"
          />
          <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            #{item.photoNumber}
          </span>
          <span className={cn("flex-1 truncate", item.done && "text-muted-foreground line-through")}>
            {goalLabels.get(item.goalCode) ?? item.goalCode}
          </span>
        </li>
      ))}
    </ul>
  );
}
