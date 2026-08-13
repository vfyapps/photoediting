"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { selfCheckItems } from "@/lib/assignments";

/**
 * Vóór het inleveren naar QC: geeft de editor een moment om terug te kijken.
 * Niet gepersisteerd — het is een prompt, geen audittrail (AGENTS.md, Screen 3).
 */
export function SelfCheckDialog({
  disabled,
  disabledReason,
  onConfirm,
}: {
  disabled: boolean;
  disabledReason?: string;
  onConfirm: () => Promise<{ ok: boolean; message?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const allChecked = checked.size === selfCheckItems.length;

  function toggle(index: number) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function submit() {
    startTransition(async () => {
      const result = await onConfirm();
      if (result.ok) {
        toast.success("Opdracht staat nu in QC.");
        setOpen(false);
        setChecked(new Set());
      } else {
        toast.error(result.message ?? "Kon niet naar QC zetten.");
      }
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button disabled={disabled} title={disabled ? disabledReason : undefined} type="button">
          Naar QC
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Voor je inlevert</DialogTitle>
          <DialogDescription>
            Loop de checklist na voordat je deze opdracht naar QC zet. Dit wordt niet bewaard —
            het is een moment om terug te kijken, geen audittrail.
          </DialogDescription>
        </DialogHeader>
        <ul className="mt-4 flex flex-col gap-2">
          {selfCheckItems.map((item, index) => (
            <li key={item}>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  checked={checked.has(index)}
                  className="mt-0.5 size-3.5 shrink-0 rounded-sm border-input accent-primary"
                  onChange={() => toggle(index)}
                  type="checkbox"
                />
                {item}
              </label>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} type="button" variant="secondary">
            Annuleren
          </Button>
          <Button disabled={!allChecked || isPending} onClick={submit} type="button">
            {isPending ? "Bezig…" : "Bevestig en zet naar QC"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
