import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "coordinator")) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Status, top QC-issues, performance per editor en maandvolume."
        eyebrow="Overzicht"
        title="Dashboard"
      />
      <EmptyState
        description="Dit scherm komt in werkpakket 4 van BUILDPLAN.md, gelezen uit de dashboard-views."
        icon={<BarChart3 aria-hidden="true" />}
        title="Nog niet gebouwd"
      />
    </div>
  );
}
