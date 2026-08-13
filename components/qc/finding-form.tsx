"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import type { QcFindingInput } from "@/app/(app)/qc/actions";
import { Button } from "@/components/ui/button";
import type { EditItem } from "@/lib/assignments";
import { cn } from "@/lib/utils";

type IssueType = { code: string; label_nl: string };

const inputClassName =
  "h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25";

export function FindingForm({
  editItems,
  issueTypes,
  findings,
  onChange,
  onSubmit,
  onCancel,
  isPending,
}: {
  editItems: EditItem[];
  issueTypes: IssueType[];
  findings: QcFindingInput[];
  onChange: (findings: QcFindingInput[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [photoNumber, setPhotoNumber] = useState<string>("");
  const [issueCode, setIssueCode] = useState(issueTypes[0]?.code ?? "");
  const [comment, setComment] = useState("");
  const photoNumbers = [...new Set(editItems.map((item) => item.photoNumber))].sort((a, b) => a - b);

  const commentRequired = issueCode === "other";
  const canAdd = issueCode.length > 0 && (!commentRequired || comment.trim().length > 0);

  function addFinding() {
    if (!canAdd) return;
    onChange([
      ...findings,
      {
        photoNumber: photoNumber ? Number.parseInt(photoNumber, 10) : null,
        issueCode,
        comment: comment.trim() || null,
      },
    ]);
    setComment("");
  }

  function removeFinding(index: number) {
    onChange(findings.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-warning-tint bg-warning-tint/40 p-3">
      <h3 className="text-sm font-semibold">Bevindingen</h3>

      {findings.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {findings.map((finding, index) => (
            <li className="flex items-start justify-between gap-2 rounded-sm bg-background px-2.5 py-1.5 text-xs" key={index}>
              <span>
                {finding.photoNumber ? <span className="font-mono font-semibold">#{finding.photoNumber} </span> : null}
                <span className="font-medium">
                  {issueTypes.find((issue) => issue.code === finding.issueCode)?.label_nl ?? finding.issueCode}
                </span>
                {finding.comment ? <span className="text-muted-foreground"> — {finding.comment}</span> : null}
              </span>
              <button
                aria-label="Bevinding verwijderen"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeFinding(index)}
                type="button"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">Nog geen bevindingen toegevoegd.</p>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">
          Foto (optioneel)
          <select
            className={cn(inputClassName, "w-24")}
            onChange={(event) => setPhotoNumber(event.target.value)}
            value={photoNumber}
          >
            <option value="">—</option>
            {photoNumbers.map((n) => (
              <option key={n} value={n}>
                #{n}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-40 flex-1 gap-1 text-xs font-medium text-muted-foreground">
          Categorie
          <select
            className={inputClassName}
            onChange={(event) => setIssueCode(event.target.value)}
            value={issueCode}
          >
            {issueTypes.map((issue) => (
              <option key={issue.code} value={issue.code}>
                {issue.label_nl}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-52 flex-[2] gap-1 text-xs font-medium text-muted-foreground">
          Toelichting {commentRequired ? "(verplicht)" : "(optioneel)"}
          <input
            className={inputClassName}
            onChange={(event) => setComment(event.target.value)}
            placeholder={commentRequired ? "Verplicht bij 'Overig'" : "Bijv. rand nog zichtbaar links"}
            type="text"
            value={comment}
          />
        </label>
        <Button disabled={!canAdd} onClick={addFinding} size="sm" type="button">
          <Plus aria-hidden="true" className="size-4" />
          Toevoegen
        </Button>
      </div>

      <div className="flex items-center gap-2 border-t border-border pt-3">
        <Button disabled={isPending || findings.length === 0} onClick={onSubmit} type="button" variant="destructive">
          {isPending ? "Bezig…" : "Bevestig afkeuren"}
        </Button>
        <Button onClick={onCancel} type="button" variant="ghost">
          Annuleren
        </Button>
        {findings.length === 0 ? (
          <span className="text-xs text-muted-foreground">Voeg minstens één bevinding toe om af te keuren.</span>
        ) : null}
      </div>
    </div>
  );
}
