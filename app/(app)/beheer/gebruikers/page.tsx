import { AlertTriangle } from "lucide-react";

import { UsersScreen } from "@/components/beheer/users-screen";
import { listUsersWithAuthMeta } from "@/app/(app)/beheer/actions";
import { ErrorState } from "@/components/ui/error-state";
import { getCurrentUser } from "@/lib/session";

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

  return <UsersScreen canManage={user?.role === "admin"} currentUserId={user?.id ?? ""} users={result.users} />;
}
