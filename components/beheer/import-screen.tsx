"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  commitAresImport,
  deleteAresExpertAlias,
  previewAresImport,
  upsertAresExpertAlias,
} from "@/app/(app)/beheer/import/actions";
import type { ImportCandidate } from "@/lib/ares-import";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Alias = { alias: string; rentalExpertId: string; rentalExpertName: string };
type Expert = { id: string; name: string };
type ImportRun = {
  id: string;
  file_name: string;
  created_count: number;
  skipped_count: number;
  created_at: string;
};
type Preview = {
  candidates: ImportCandidate[];
  ignoredNonAt: number;
  ignoredNotQualifying: number;
  ungeocoded: { land: string; postcode: string; count: number }[];
  openShootCount: number;
};

const priorityLabels: Record<string, string> = { high: "Hoog", medium: "Gemiddeld", low: "Laag" };
const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/25";

export function ImportScreen({
  aliases,
  experts,
  recentRuns,
  avoidedShootCostEur,
}: {
  aliases: Alias[];
  experts: Expert[];
  recentRuns: ImportRun[];
  avoidedShootCostEur: number;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isParsing, startParsing] = useTransition();
  const [isCommitting, startCommitting] = useTransition();

  async function runPreview(nextFile: File) {
    startParsing(async () => {
      const result = await previewAresImport(nextFile);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setPreview(result);
      setSelected(new Set(result.candidates.filter((c) => c.group === "new").map((c) => c.rowKey)));
    });
  }

  function pickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;
    if (!chosen.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Alleen .xlsx-bestanden.");
      return;
    }
    setFile(chosen);
    setPreview(null);
    void runPreview(chosen);
  }

  function toggle(rowKey: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  }

  const grouped = useMemo(() => {
    const groups: Record<ImportCandidate["group"], ImportCandidate[]> = {
      new: [],
      winter_overlap: [],
      existing: [],
      problem: [],
    };
    for (const c of preview?.candidates ?? []) groups[c.group].push(c);
    return groups;
  }, [preview]);

  const selectedCandidates = (preview?.candidates ?? []).filter((c) => selected.has(c.rowKey));
  const savings = selectedCandidates.length * avoidedShootCostEur;

  function commit() {
    if (!file) return;
    startCommitting(async () => {
      const result = await commitAresImport({
        file,
        selectedRowKeys: [...selected],
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(
        result.skippedCount > 0
          ? `${result.shootCount} shoots opgeslagen, ${result.createdCount} opdrachten aangemaakt, ${result.skippedCount} overgeslagen (al aanwezig).`
          : `${result.shootCount} shoots opgeslagen, ${result.createdCount} opdrachten aangemaakt.`,
      );
      setFile(null);
      setPreview(null);
      setSelected(new Set());
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Verhuurexpert-aliassen</h2>
        <p className="text-xs text-muted-foreground">
          Ares gebruikt inlognamen (&quot;daniel&quot;), de app volledige namen. Onbekende aliassen blokkeren de import van die
          rij tot ze hier gekoppeld zijn.
        </p>
        <AliasTable aliases={aliases} experts={experts} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Import</h2>
        <input accept=".xlsx" className="hidden" onChange={handleFileChange} ref={fileInputRef} type="file" />
        <div>
          <Button disabled={isParsing} onClick={pickFile} size="sm">
            <Upload className="size-4" />
            {isParsing ? "Bezig met inlezen…" : "Ares-export (.xlsx) kiezen"}
          </Button>
          {file ? <span className="ml-3 text-xs text-muted-foreground">{file.name}</span> : null}
        </div>

        {preview ? (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              {preview.openShootCount} openstaande shoots gaan mee naar de kaart bij importeren.{" "}
              {preview.ignoredNonAt} rijen genegeerd (niet AT als kandidaat, tellen wel mee op de kaart),{" "}
              {preview.ignoredNotQualifying} rijen voldoen niet aan de summer→winter-regel.
            </p>

            {preview.ungeocoded.length > 0 ? (
              <div className="rounded-md border border-warning-tint bg-warning-tint p-3 text-xs">
                <p className="mb-1 flex items-center gap-1.5 font-medium text-warning">
                  <AlertTriangle className="size-3.5" />
                  {preview.ungeocoded.length} postcode(s) niet gegeocodeerd — deze shoots verschijnen niet op de kaart
                </p>
                <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground">
                  {preview.ungeocoded.map((u) => (
                    <li className="font-mono" key={`${u.land}.${u.postcode}`}>
                      {u.land}.{u.postcode} ({u.count}×)
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <CandidateGroup
              description="Wordt aangemaakt met status 'nieuw' en doel 'summer_to_winter'."
              items={grouped.new}
              savingsPerItem={avoidedShootCostEur}
              selectable
              selected={selected}
              title="Nieuw"
              onToggle={toggle}
            />
            <CandidateGroup
              description="Deze woningen hebben elders al een winter-shoot (afgerond of gepland). Standaard uitgevinkt."
              items={grouped.winter_overlap}
              savingsPerItem={avoidedShootCostEur}
              selectable
              selected={selected}
              title="Heeft al een winter-shoot"
              onToggle={toggle}
            />
            <CandidateGroup
              description="Staat al in de app (op acco-id) en wordt overgeslagen."
              items={grouped.existing}
              title="Al in de app"
            />
            <CandidateGroup
              description="Onbekende expert-alias of onleesbare datum. Koppel de alias hierboven en kies het bestand opnieuw."
              items={grouped.problem}
              title="Probleem"
            />

            <div className="sticky bottom-4 flex items-center justify-between rounded-md border border-border bg-card p-3 shadow-sm">
              <div className="text-sm">
                <span className="font-semibold">{selectedCandidates.length}</span> opdracht(en) geselecteerd ·{" "}
                <span className="text-muted-foreground">
                  geschatte besparing €{savings.toLocaleString("nl-NL")}
                </span>
              </div>
              <Button disabled={isCommitting} onClick={commit}>
                {isCommitting
                  ? "Bezig…"
                  : selectedCandidates.length > 0
                    ? `Importeren (${selectedCandidates.length} opdrachten + kaartdata)`
                    : "Alleen kaartdata bijwerken"}
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {recentRuns.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Recente imports</h2>
          <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
            {recentRuns.map((run) => (
              <li key={run.id}>
                {new Date(run.created_at).toLocaleString("nl-NL")} — {run.file_name}: {run.created_count} aangemaakt,{" "}
                {run.skipped_count} overgeslagen
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function CandidateGroup({
  title,
  description,
  items,
  selectable = false,
  selected,
  onToggle,
  savingsPerItem,
}: {
  title: string;
  description: string;
  items: ImportCandidate[];
  selectable?: boolean;
  selected?: Set<string>;
  onToggle?: (rowKey: string) => void;
  savingsPerItem?: number;
}) {
  const [open, setOpen] = useState(items.length > 0 && items.length <= 30);

  return (
    <div className="rounded-md border border-border">
      <button
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span>
          {title} <span className="font-mono text-muted-foreground">({items.length})</span>
        </span>
        {savingsPerItem && items.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            max. €{(items.length * savingsPerItem).toLocaleString("nl-NL")}
          </span>
        ) : null}
      </button>
      <p className="border-t border-border px-3 py-1.5 text-xs text-muted-foreground">{description}</p>
      {open && items.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border border-t border-border">
          {items.map((item) => (
            <li className="flex items-center gap-3 px-3 py-1.5 text-xs" key={item.rowKey}>
              {selectable ? (
                <input
                  checked={selected?.has(item.rowKey) ?? false}
                  className="size-3.5 accent-primary"
                  onChange={() => onToggle?.(item.rowKey)}
                  type="checkbox"
                />
              ) : (
                <span className="size-3.5" />
              )}
              <span className="w-28 shrink-0 font-mono font-semibold">{item.accoId}</span>
              {item.priority ? <Badge status="neutral">{priorityLabels[item.priority]}</Badge> : null}
              <span className="text-muted-foreground">{item.expertAlias || "—"}</span>
              <span className="text-muted-foreground">{item.requestDate ?? "—"}</span>
              {item.problem ? (
                <span className="ml-auto flex items-center gap-1 text-warning">
                  <AlertTriangle className="size-3.5" />
                  {item.problem}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AliasTable({ aliases, experts }: { aliases: Alias[]; experts: Expert[] }) {
  const router = useRouter();
  const [newAlias, setNewAlias] = useState("");
  const [newExpertId, setNewExpertId] = useState("");
  const [isPending, startTransition] = useTransition();

  function add() {
    startTransition(async () => {
      const result = await upsertAresExpertAlias({ alias: newAlias, rentalExpertId: newExpertId });
      if (result.ok) {
        toast.success("Alias gekoppeld.");
        setNewAlias("");
        setNewExpertId("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function remove(alias: string) {
    startTransition(async () => {
      const result = await deleteAresExpertAlias(alias);
      if (result.ok) {
        toast.success("Alias verwijderd.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
        {aliases.map((a) => (
          <li className="flex items-center gap-2 px-3 py-1.5 text-xs" key={a.alias}>
            <CheckCircle2 className="size-3.5 shrink-0 text-success" />
            <span className="w-32 shrink-0 font-mono">{a.alias}</span>
            <span className="text-muted-foreground">→ {a.rentalExpertName}</span>
            <Button
              className="ml-auto"
              disabled={isPending}
              onClick={() => remove(a.alias)}
              size="sm"
              variant="ghost"
            >
              Ontkoppelen
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end gap-2">
        <Input
          className="max-w-40"
          onChange={(event) => setNewAlias(event.target.value)}
          placeholder="alias (bv. daniel)"
          value={newAlias}
        />
        <select className={selectClassName + " h-9"} onChange={(event) => setNewExpertId(event.target.value)} value={newExpertId}>
          <option value="">Kies verhuurexpert</option>
          {experts.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <Button disabled={isPending || !newAlias.trim() || !newExpertId} onClick={add} size="sm" variant="secondary">
          Koppelen
        </Button>
      </div>
    </div>
  );
}
