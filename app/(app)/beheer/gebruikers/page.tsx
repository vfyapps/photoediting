import { AlertTriangle } from "lucide-react";

import { UsersScreen } from "@/components/beheer/users-screen";
import { listUsersWithAuthMeta } from "@/app/(app)/beheer/actions";
import { ErrorState } from "@/components/ui/error-state";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BeheerGebruikersPage() {
  const [user, result] = await Promise.all([getCurrentUser(), listUsersWithAuthMeta()]);

  if (!result.ok) {
    return (
      <ErrorState
        description={result.message}
        icon={<AlertTriangle className="size-8" />}
        title="Gebruikers konden niet worden geladen"
      />
    );
  }

  // Alleen zichtbaar voor coordinator/admin (RLS: read_admin_events) - het
  // auditspoor voor beheeracties (BUILDPLAN-V3.md V3-WP7.4).
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("admin_events")
    .select("id, action, target, created_at, app_users(full_name)")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <UsersScreen
      canManage={user?.role === "admin"}
      currentUserId={user?.id ?? ""}
      recentEvents={(events ?? []).map((e) => ({
        id: e.id,
        action: e.action,
        target: e.target,
        createdAt: e.created_at,
        actorName: (e.app_users as { full_name: string } | null)?.full_name ?? "onbekend",
      }))}
      users={result.users}
    />
  );
}
