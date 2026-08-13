"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { upsertEditingGoal, upsertQcIssueType } from "@/app/(app)/beheer/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type EditingGoal = {
  code: string;
  label_nl: string;
  label_en: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};
type QcIssueType = {
  code: string;
  label_nl: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

const codePattern = /^[a-z0-9_]+$/;

export function ReferenceDataScreen({ goals, issueTypes }: { goals: EditingGoal[]; issueTypes: QcIssueType[] }) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Editing goals</h2>
        <div className="flex flex-col gap-2">
          {goals.map((goal) => (
            <GoalRow goal={goal} key={goal.code} />
          ))}
        </div>
        <NewGoalForm nextSortOrder={goals.length} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">QC-issuetypes</h2>
        <div className="flex flex-col gap-2">
          {issueTypes.map((issue) => (
            <IssueTypeRow issue={issue} key={issue.code} />
          ))}
        </div>
        <NewIssueTypeForm nextSortOrder={issueTypes.length} />
      </section>
    </div>
  );
}

function GoalRow({ goal }: { goal: EditingGoal }) {
  const router = useRouter();
  const [labelNl, setLabelNl] = useState(goal.label_nl);
  const [labelEn, setLabelEn] = useState(goal.label_en);
  const [isPending, startTransition] = useTransition();
  const dirty = labelNl !== goal.label_nl || labelEn !== goal.label_en;

  function save() {
    startTransition(async () => {
      const result = await upsertEditingGoal({
        code: goal.code,
        labelNl,
        labelEn,
        description: goal.description,
        isActive: goal.is_active,
        sortOrder: goal.sort_order,
      });
      if (result.ok) {
        toast.success("Goal opgeslagen.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function toggleActive() {
    startTransition(async () => {
      const result = await upsertEditingGoal({
        code: goal.code,
        labelNl: goal.label_nl,
        labelEn: goal.label_en,
        description: goal.description,
        isActive: !goal.is_active,
        sortOrder: goal.sort_order,
      });
      if (result.ok) {
        toast.success(goal.is_active ? "Goal gedeactiveerd." : "Goal geactiveerd.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-2">
      <code className="w-40 shrink-0 font-mono text-xs text-muted-foreground">{goal.code}</code>
      <Input className="max-w-48" onChange={(event) => setLabelNl(event.target.value)} placeholder="NL" value={labelNl} />
      <Input className="max-w-48" onChange={(event) => setLabelEn(event.target.value)} placeholder="EN" value={labelEn} />
      <Badge status={goal.is_active ? "success" : "critical"}>{goal.is_active ? "Actief" : "Inactief"}</Badge>
      <div className="ml-auto flex items-center gap-2">
        <Button disabled={isPending || !dirty} onClick={save} size="sm" variant="secondary">
          Opslaan
        </Button>
        <Button disabled={isPending} onClick={toggleActive} size="sm" variant="ghost">
          {goal.is_active ? "Deactiveren" : "Activeren"}
        </Button>
      </div>
    </div>
  );
}

function NewGoalForm({ nextSortOrder }: { nextSortOrder: number }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [labelNl, setLabelNl] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [isPending, startTransition] = useTransition();
  const validCode = codePattern.test(code);

  function submit() {
    startTransition(async () => {
      const result = await upsertEditingGoal({
        code,
        labelNl,
        labelEn,
        description: null,
        isActive: true,
        sortOrder: nextSortOrder,
      });
      if (result.ok) {
        toast.success("Goal toegevoegd.");
        setCode("");
        setLabelNl("");
        setLabelEn("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Input className="max-w-40" onChange={(event) => setCode(event.target.value)} placeholder="code_zoals_dit" value={code} />
      <Input className="max-w-48" onChange={(event) => setLabelNl(event.target.value)} placeholder="Naam (NL)" value={labelNl} />
      <Input className="max-w-48" onChange={(event) => setLabelEn(event.target.value)} placeholder="Naam (EN)" value={labelEn} />
      <Button
        disabled={isPending || !validCode || !labelNl.trim() || !labelEn.trim()}
        onClick={submit}
        size="sm"
        variant="secondary"
      >
        <Plus className="size-3.5" />
        Toevoegen
      </Button>
    </div>
  );
}

function IssueTypeRow({ issue }: { issue: QcIssueType }) {
  const router = useRouter();
  const [labelNl, setLabelNl] = useState(issue.label_nl);
  const [isPending, startTransition] = useTransition();
  const dirty = labelNl !== issue.label_nl;

  function save() {
    startTransition(async () => {
      const result = await upsertQcIssueType({
        code: issue.code,
        labelNl,
        description: issue.description,
        isActive: issue.is_active,
        sortOrder: issue.sort_order,
      });
      if (result.ok) {
        toast.success("Issuetype opgeslagen.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function toggleActive() {
    startTransition(async () => {
      const result = await upsertQcIssueType({
        code: issue.code,
        labelNl: issue.label_nl,
        description: issue.description,
        isActive: !issue.is_active,
        sortOrder: issue.sort_order,
      });
      if (result.ok) {
        toast.success(issue.is_active ? "Issuetype gedeactiveerd." : "Issuetype geactiveerd.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-2">
      <code className="w-40 shrink-0 font-mono text-xs text-muted-foreground">{issue.code}</code>
      <Input className="max-w-64" onChange={(event) => setLabelNl(event.target.value)} value={labelNl} />
      <Badge status={issue.is_active ? "success" : "critical"}>{issue.is_active ? "Actief" : "Inactief"}</Badge>
      <div className="ml-auto flex items-center gap-2">
        <Button disabled={isPending || !dirty} onClick={save} size="sm" variant="secondary">
          Opslaan
        </Button>
        <Button disabled={isPending} onClick={toggleActive} size="sm" variant="ghost">
          {issue.is_active ? "Deactiveren" : "Activeren"}
        </Button>
      </div>
    </div>
  );
}

function NewIssueTypeForm({ nextSortOrder }: { nextSortOrder: number }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [labelNl, setLabelNl] = useState("");
  const [isPending, startTransition] = useTransition();
  const validCode = codePattern.test(code);

  function submit() {
    startTransition(async () => {
      const result = await upsertQcIssueType({
        code,
        labelNl,
        description: null,
        isActive: true,
        sortOrder: nextSortOrder,
      });
      if (result.ok) {
        toast.success("Issuetype toegevoegd.");
        setCode("");
        setLabelNl("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Input className="max-w-40" onChange={(event) => setCode(event.target.value)} placeholder="code_zoals_dit" value={code} />
      <Input className="max-w-64" onChange={(event) => setLabelNl(event.target.value)} placeholder="Naam" value={labelNl} />
      <Button disabled={isPending || !validCode || !labelNl.trim()} onClick={submit} size="sm" variant="secondary">
        <Plus className="size-3.5" />
        Toevoegen
      </Button>
    </div>
  );
}
