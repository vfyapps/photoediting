"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateSetting } from "@/app/(app)/beheer/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const fieldLabels: Record<string, string> = {
  qc_reminder_days: "QC-termijn (dagen)",
  max_photos_per_property: "Richtlijn foto's per woning",
  qc_issue_callout_threshold: "Drempel QC-callout",
  magnific_base_url: "Magnific-basis-URL",
  ares_base_url: "Ares-basis-URL",
};

type Setting = { key: string; value: string | null; description: string | null };

export function SettingsScreen({ settings }: { settings: Setting[] }) {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      {settings.map((setting) => (
        <SettingField key={setting.key} setting={setting} />
      ))}
    </div>
  );
}

function SettingField({ setting }: { setting: Setting }) {
  const router = useRouter();
  const [value, setValue] = useState(setting.value ?? "");
  const [isPending, startTransition] = useTransition();
  const dirty = value !== (setting.value ?? "");

  function save() {
    startTransition(async () => {
      const result = await updateSetting({ key: setting.key, value });
      if (result.ok) {
        toast.success("Instelling opgeslagen.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 border-b border-border pb-5">
      <Field hint={setting.description ?? undefined} label={fieldLabels[setting.key] ?? setting.key}>
        <Input onChange={(event) => setValue(event.target.value)} value={value} />
      </Field>
      <div>
        <Button disabled={isPending || !dirty} onClick={save} size="sm" variant="secondary">
          {isPending ? "Bezig…" : "Opslaan"}
        </Button>
      </div>
    </div>
  );
}
