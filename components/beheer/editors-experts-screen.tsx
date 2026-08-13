"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { linkEditorToUser, upsertEditor, upsertExpert } from "@/app/(app)/beheer/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Editor = { id: string; name: string; user_id: string | null; is_active: boolean };
type Expert = { id: string; name: string; email: string | null; country: string | null; is_active: boolean };
type UserOption = { id: string; fullName: string };

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/25";

export function EditorsExpertsScreen({
  editors,
  experts,
  users,
}: {
  editors: Editor[];
  experts: Expert[];
  users: UserOption[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Editors</h2>
        <EditorsTable editors={editors} users={users} />
        <NewEditorForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Verhuurexperts</h2>
        <ExpertsTable experts={experts} />
        <NewExpertForm />
      </section>
    </div>
  );
}

function EditorsTable({ editors, users }: { editors: Editor[]; users: UserOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleActive(editor: Editor) {
    startTransition(async () => {
      const result = await upsertEditor({ id: editor.id, name: editor.name, isActive: !editor.is_active });
      if (result.ok) {
        toast.success(editor.is_active ? "Editor gedeactiveerd." : "Editor geactiveerd.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function link(editor: Editor, userId: string) {
    startTransition(async () => {
      const result = await linkEditorToUser({ editorId: editor.id, userId: userId || null });
      if (result.ok) {
        toast.success("Koppeling bijgewerkt.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  if (editors.length === 0) return <p className="text-xs text-muted-foreground">Nog geen editors.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Naam</TableHead>
          <TableHead>Gekoppeld account</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {editors.map((editor) => (
          <TableRow key={editor.id}>
            <TableCell className="font-medium">{editor.name}</TableCell>
            <TableCell>
              <select
                className={selectClassName}
                disabled={isPending}
                onChange={(event) => link(editor, event.target.value)}
                value={editor.user_id ?? ""}
              >
                <option value="">Geen account</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </TableCell>
            <TableCell>
              <Button disabled={isPending} onClick={() => toggleActive(editor)} size="sm" variant={editor.is_active ? "secondary" : "ghost"}>
                {editor.is_active ? "Deactiveren" : "Activeren"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function NewEditorForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await upsertEditor({ id: null, name, isActive: true });
      if (result.ok) {
        toast.success("Editor toegevoegd.");
        setName("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex items-end gap-2">
      <Input className="max-w-64" onChange={(event) => setName(event.target.value)} placeholder="Naam nieuwe editor" value={name} />
      <Button disabled={isPending || !name.trim()} onClick={submit} size="sm" variant="secondary">
        <Plus className="size-3.5" />
        Toevoegen
      </Button>
    </div>
  );
}

function ExpertsTable({ experts }: { experts: Expert[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleActive(expert: Expert) {
    startTransition(async () => {
      const result = await upsertExpert({
        id: expert.id,
        name: expert.name,
        email: expert.email,
        country: expert.country,
        isActive: !expert.is_active,
      });
      if (result.ok) {
        toast.success(expert.is_active ? "Verhuurexpert gedeactiveerd." : "Verhuurexpert geactiveerd.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  if (experts.length === 0) return <p className="text-xs text-muted-foreground">Nog geen verhuurexperts.</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Naam</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Land</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {experts.map((expert) => (
          <TableRow key={expert.id}>
            <TableCell className="font-medium">{expert.name}</TableCell>
            <TableCell className="text-muted-foreground">{expert.email ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{expert.country ?? "—"}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Badge status={expert.is_active ? "success" : "critical"}>{expert.is_active ? "Actief" : "Inactief"}</Badge>
                <Button disabled={isPending} onClick={() => toggleActive(expert)} size="sm" variant="ghost">
                  {expert.is_active ? "Deactiveren" : "Activeren"}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function NewExpertForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await upsertExpert({ id: null, name, email: email || null, country: country || null, isActive: true });
      if (result.ok) {
        toast.success("Verhuurexpert toegevoegd.");
        setName("");
        setEmail("");
        setCountry("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Input className="max-w-56" onChange={(event) => setName(event.target.value)} placeholder="Naam" value={name} />
      <Input className="max-w-64" onChange={(event) => setEmail(event.target.value)} placeholder="E-mail (optioneel)" value={email} />
      <Input className="max-w-24" onChange={(event) => setCountry(event.target.value)} placeholder="Land" value={country} />
      <Button disabled={isPending || !name.trim()} onClick={submit} size="sm" variant="secondary">
        <Plus className="size-3.5" />
        Toevoegen
      </Button>
    </div>
  );
}
