"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { addEditItems, deleteEditItem } from "@/app/(app)/opdrachten/[id]/actions";
import { toggleEditItemDone } from "@/app/actions";
import { Button } from "@/components/ui/button";
import type { EditItem } from "@/lib/assignments";
import { parsePhotoNumbers } from "@/lib/assignments";
import { cn } from "@/lib/utils";

type GoalOption = { code: string; label_nl: string };

export function GoalPhotosPanel({
  assignmentId,
  editItems,
  goals,
  maxPhotosPerProperty,
}: {
  assignmentId: string;
  editItems: EditItem[];
  goals: GoalOption[];
  maxPhotosPerProperty: number;
}) {
  const totalPhotos = new Set(editItems.map((item) => item.photoNumber)).size;
  const activeGoalCodes = new Set(editItems.map((item) => item.goalCode));
  const [selectedGoal, setSelectedGoal] = useState(goals[0]?.code ?? "");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Foto&apos;s per goal</h2>
        <span
          className={cn(
            "font-mono text-xs tabular-nums",
            totalPhotos > maxPhotosPerProperty ? "text-warning" : "text-muted-foreground",
          )}
        >
          {totalPhotos} van max. {maxPhotosPerProperty} foto&apos;s
        </span>
      </div>
      {totalPhotos > maxPhotosPerProperty ? (
        <p className="rounded-md border border-warning-tint bg-warning-tint px-3 py-2 text-xs text-warning">
          Deze opdracht heeft meer foto&apos;s dan de richtlijn van {maxPhotosPerProperty}. Dat mag,
          controleer of dat bedoeld is.
        </p>
      ) : null}

      <AddPhotosForm assignmentId={assignmentId} goals={goals} onGoalChange={setSelectedGoal} selectedGoal={selectedGoal} />

      <div className="flex flex-col gap-3">
        {goals
          .filter((goal) => activeGoalCodes.has(goal.code))
          .map((goal) => (
            <GoalGroup
              editItems={editItems.filter((item) => item.goalCode === goal.code)}
              goalLabel={goal.label_nl}
              key={goal.code}
            />
          ))}
        {editItems.length === 0 ? (
          <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            Nog geen foto&apos;s toegevoegd. Voeg hierboven fotonummers toe per goal.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function AddPhotosForm({
  assignmentId,
  goals,
  selectedGoal,
  onGoalChange,
}: {
  assignmentId: string;
  goals: GoalOption[];
  selectedGoal: string;
  onGoalChange: (goal: string) => void;
}) {
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const preview = parsePhotoNumbers(input);

  function submit() {
    if (!selectedGoal || preview.length === 0) return;
    startTransition(async () => {
      const result = await addEditItems(assignmentId, selectedGoal, preview);
      if (result.ok) {
        toast.success(
          preview.length === 1 ? "1 foto toegevoegd." : `${preview.length} foto's toegevoegd.`,
        );
        setInput("");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid flex-1 min-w-40 gap-1 text-xs font-medium text-muted-foreground">
          Editing goal
          <select
            aria-label="Editing goal"
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25"
            onChange={(event) => onGoalChange(event.target.value)}
            value={selectedGoal}
          >
            {goals.map((goal) => (
              <option key={goal.code} value={goal.code}>
                {goal.label_nl}
              </option>
            ))}
          </select>
        </label>
        <label className="grid flex-[2] min-w-48 gap-1 text-xs font-medium text-muted-foreground">
          Fotonummers
          <input
            aria-label="Fotonummers, komma-gescheiden"
            className="h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/25"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Bijv. 12, 15, 18"
            type="text"
            value={input}
          />
        </label>
        <Button disabled={isPending || preview.length === 0} onClick={submit} size="md" type="button">
          <Plus aria-hidden="true" className="size-4" />
          Toevoegen
        </Button>
      </div>
      {preview.length > 0 ? (
        <p className="text-[11px] text-muted-foreground">
          Voegt {preview.length === 1 ? "1 foto toe" : `${preview.length} foto's toe`}: #{preview.join(", #")}
        </p>
      ) : null}
    </div>
  );
}

function GoalGroup({ goalLabel, editItems }: { goalLabel: string; editItems: EditItem[] }) {
  const [, startTransition] = useTransition();
  const sorted = [...editItems].sort((a, b) => a.photoNumber - b.photoNumber);

  function toggle(item: EditItem, done: boolean) {
    startTransition(async () => {
      const result = await toggleEditItemDone(item.id, done);
      if (!result.ok) toast.error(result.message);
    });
  }

  function remove(item: EditItem) {
    startTransition(async () => {
      const result = await deleteEditItem(item.id);
      if (!result.ok) toast.error(result.message);
    });
  }

  return (
    <div className="rounded-md border border-border">
      <div className="border-b border-border bg-muted/30 px-3 py-1.5 text-xs font-semibold">{goalLabel}</div>
      <ul className="divide-y divide-border">
        {sorted.map((item) => (
          <li className="flex items-center gap-3 px-3 py-2 text-sm" key={item.id}>
            <input
              aria-label={`Foto ${item.photoNumber} afvinken`}
              checked={item.done}
              className="size-3.5 rounded-sm border-input accent-primary"
              onChange={(event) => toggle(item, event.target.checked)}
              type="checkbox"
            />
            <span className={cn("flex-1 font-mono text-xs tabular-nums", item.done && "text-muted-foreground line-through")}>
              #{item.photoNumber}
            </span>
            <button
              aria-label={`Foto ${item.photoNumber} verwijderen`}
              className="rounded-sm p-1 text-muted-foreground hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring"
              onClick={() => remove(item)}
              type="button"
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
