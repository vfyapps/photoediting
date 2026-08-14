"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { inviteUser, setUserActive, updateUserRole, type AdminUserRow } from "@/app/(app)/beheer/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const roles = ["admin", "coordinator", "editor", "viewer"] as const;
const roleLabels: Record<(typeof roles)[number], string> = {
  admin: "Admin",
  coordinator: "Coördinator",
  editor: "Editor",
  viewer: "Viewer",
};

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50";

function formatLastSignIn(value: string | null) {
  if (!value) return "Nog nooit ingelogd";
  return new Date(value).toLocaleDateString("nl-NL", { year: "numeric", month: "short", day: "numeric" });
}

type AdminEvent = { id: string; action: string; target: string; createdAt: string; actorName: string };

const actionLabels: Record<string, string> = {
  invite_user: "Gebruiker uitgenodigd",
  update_user_role: "Rol gewijzigd",
  activate_user: "Account geactiveerd",
  deactivate_user: "Account gedeactiveerd",
  create_editor: "Editor aangemaakt",
  update_editor: "Editor gewijzigd",
  link_editor_to_user: "Editor gekoppeld",
  create_expert: "Verhuurexpert aangemaakt",
  update_expert: "Verhuurexpert gewijzigd",
  create_photographer: "Fotograaf aangemaakt",
  update_photographer: "Fotograaf gewijzigd",
  update_setting: "Instelling gewijzigd",
  upsert_editing_goal: "Editing goal opgeslagen",
  upsert_qc_issue_type: "QC-issuetype opgeslagen",
  cancel_assignment: "Opdracht geannuleerd",
  delete_assignment: "Opdracht verwijderd",
};

export function UsersScreen({
  users,
  canManage,
  currentUserId,
  recentEvents,
}: {
  users: AdminUserRow[];
  canManage: boolean;
  currentUserId: string;
  recentEvents: AdminEvent[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {canManage ? "Rol wijzigen of een account deactiveren werkt direct." : "Alleen een admin kan accounts wijzigen."}
        </p>
        {canManage ? <InviteUserDialog /> : null}
      </div>

      {users.length === 0 ? (
        <EmptyState description="Nodig de eerste collega uit." icon={<UserPlus className="size-8" />} title="Nog geen gebruikers" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Laatste login</TableHead>
              <TableHead>Actief</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <UserRow canManage={canManage} isSelf={user.id === currentUserId} key={user.id} user={user} />
            ))}
          </TableBody>
        </Table>
      )}

      {canManage && recentEvents.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Recente beheeracties</h2>
          <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
            {recentEvents.map((event) => (
              <li key={event.id}>
                {new Date(event.createdAt).toLocaleString("nl-NL")} — {event.actorName}:{" "}
                {actionLabels[event.action] ?? event.action} ({event.target})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function UserRow({ user, canManage, isSelf }: { user: AdminUserRow; canManage: boolean; isSelf: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function changeRole(role: (typeof roles)[number]) {
    startTransition(async () => {
      const result = await updateUserRole({ userId: user.id, role });
      if (result.ok) {
        toast.success("Rol gewijzigd.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function toggleActive() {
    startTransition(async () => {
      const result = await setUserActive({ userId: user.id, isActive: !user.isActive });
      if (result.ok) {
        toast.success(user.isActive ? "Account gedeactiveerd." : "Account geactiveerd.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{user.fullName}</TableCell>
      <TableCell className="text-muted-foreground">{user.email ?? "—"}</TableCell>
      <TableCell>
        {canManage ? (
          <select
            className={selectClassName}
            disabled={isPending || (isSelf && user.role === "admin")}
            onChange={(event) => changeRole(event.target.value as (typeof roles)[number])}
            value={user.role}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
        ) : (
          <Badge status="neutral">{roleLabels[user.role]}</Badge>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">{formatLastSignIn(user.lastSignInAt)}</TableCell>
      <TableCell>
        {canManage ? (
          <Button disabled={isPending || isSelf} onClick={toggleActive} size="sm" variant={user.isActive ? "secondary" : "ghost"}>
            {user.isActive ? "Deactiveren" : "Activeren"}
          </Button>
        ) : (
          <Badge status={user.isActive ? "success" : "critical"}>{user.isActive ? "Actief" : "Inactief"}</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}

function InviteUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("editor");
  const [isPending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const result = await inviteUser({ email, fullName, role });
      if (result.ok) {
        toast.success("Uitnodiging verstuurd.");
        setOpen(false);
        setEmail("");
        setFullName("");
        setRole("editor");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4" />
          Uitnodigen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe gebruiker uitnodigen</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Field label="Naam">
            <Input onChange={(event) => setFullName(event.target.value)} value={fullName} />
          </Field>
          <Field label="E-mailadres">
            <Input onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          </Field>
          <Field label="Rol">
            <select
              className={selectClassName + " h-9 w-full"}
              onChange={(event) => setRole(event.target.value as (typeof roles)[number])}
              value={role}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {roleLabels[r]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <DialogFooter>
          <Button disabled={isPending || !email || !fullName} onClick={submit}>
            {isPending ? "Bezig…" : "Uitnodiging versturen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
