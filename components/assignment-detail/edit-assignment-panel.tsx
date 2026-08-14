"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Pencil, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  cancelAssignment,
  deleteAssignment,
  updateAssignmentDetails,
} from "@/app/(app)/opdrachten/[id]/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { priorityLabels } from "@/lib/assignments";

type NameOption = { id: string; name: string };

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25";
const textareaClassName =
  "min-h-24 w-full rounded-md border border-input bg-background p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25";

export function EditAssignmentDialog({
  assignmentId,
  accoId,
  priority,
  requestDate,
  briefing,
  currentEditorId,
  currentRentalExpertId,
  editors,
  rentalExperts,
}: {
  assignmentId: string;
  accoId: string;
  priority: "low" | "medium" | "high";
  requestDate: string | null;
  briefing: string | null;
  currentEditorId: string | null;
  currentRentalExpertId: string | null;
  editors: NameOption[];
  rentalExperts: NameOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accoIdValue, setAccoIdValue] = useState(accoId);
  const [priorityValue, setPriorityValue] = useState(priority);
  const [requestDateValue, setRequestDateValue] = useState(requestDate ?? "");
  const [briefingValue, setBriefingValue] = useState(briefing ?? "");
  const [editorId, setEditorId] = useState(currentEditorId ?? "");
  const [rentalExpertId, setRentalExpertId] = useState(currentRentalExpertId ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateAssignmentDetails({
        assignmentId,
        accoId: accoIdValue,
        rentalExpertId: rentalExpertId || null,
        editorId: editorId || null,
        priority: priorityValue,
        requestDate: requestDateValue || null,
        briefing: briefingValue.trim() || null,
      });
      if (result.ok) {
        toast.success("Opdracht opgeslagen.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Pencil className="size-4" />
          Bewerken
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opdracht bewerken</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Field label="Acco-id">
            <Input onChange={(event) => setAccoIdValue(event.target.value)} value={accoIdValue} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Verhuurexpert">
              <select
                className={selectClassName}
                onChange={(event) => setRentalExpertId(event.target.value)}
                value={rentalExpertId}
              >
                <option value="">Onbekend</option>
                {rentalExperts.map((expert) => (
                  <option key={expert.id} value={expert.id}>
                    {expert.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Editor">
              <select className={selectClassName} onChange={(event) => setEditorId(event.target.value)} value={editorId}>
                <option value="">Niet toegewezen</option>
                {editors.map((editor) => (
                  <option key={editor.id} value={editor.id}>
                    {editor.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prioriteit">
              <select
                className={selectClassName}
                onChange={(event) => setPriorityValue(event.target.value as "low" | "medium" | "high")}
                value={priorityValue}
              >
                {(["low", "medium", "high"] as const).map((p) => (
                  <option key={p} value={p}>
                    {priorityLabels[p]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Aanvraagdatum">
              <Input
                onChange={(event) => setRequestDateValue(event.target.value)}
                type="date"
                value={requestDateValue}
              />
            </Field>
          </div>
          <Field label="Briefing">
            <textarea
              className={textareaClassName}
              onChange={(event) => setBriefingValue(event.target.value)}
              value={briefingValue}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button disabled={isPending || !accoIdValue.trim()} onClick={save}>
            {isPending ? "Bezig…" : "Opslaan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CancelAssignmentDialog({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await cancelAssignment({ assignmentId, reason });
      if (result.ok) {
        toast.success("Opdracht geannuleerd.");
        setOpen(false);
        setReason("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <XCircle className="size-4" />
          Annuleren
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opdracht annuleren</DialogTitle>
        </DialogHeader>
        <p className="pt-2 text-sm text-muted-foreground">
          Zet deze opdracht op &quot;AI afgewezen&quot;, buiten de QC-flow om. Bijvoorbeeld bij een dubbel
          geïmporteerde of verkeerde woning. Geef een reden op — die is zichtbaar op het detailscherm.
        </p>
        <div className="pt-2">
          <Field label="Reden">
            <textarea
              className={textareaClassName}
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button disabled={isPending || !reason.trim()} onClick={submit} variant="destructive">
            {isPending ? "Bezig…" : "Annuleren bevestigen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteAssignmentDialog({ assignmentId, accoId }: { assignmentId: string; accoId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await deleteAssignment({ assignmentId, accoId, confirmAccoId: confirmText });
      if (result.ok) {
        toast.success("Opdracht verwijderd.");
        router.push("/");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmText("");
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Trash2 className="size-4 text-destructive" />
          Verwijderen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Opdracht permanent verwijderen</DialogTitle>
        </DialogHeader>
        <p className="flex items-start gap-2 pt-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          Dit kan niet ongedaan worden gemaakt. Alle foto&apos;s, QC-historie en statusgeschiedenis van deze
          opdracht worden ook verwijderd.
        </p>
        <div className="pt-2">
          <Field hint={`Typ "${accoId}" om te bevestigen`} label="Acco-id">
            <Input onChange={(event) => setConfirmText(event.target.value)} value={confirmText} />
          </Field>
        </div>
        <DialogFooter>
          <Button disabled={isPending || confirmText !== accoId} onClick={submit} variant="destructive">
            {isPending ? "Bezig…" : "Definitief verwijderen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
