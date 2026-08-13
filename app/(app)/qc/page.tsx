import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/session";

export default async function QcPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "coordinator")) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="De QC-wachtrij, met bevindingen per foto en sneltoetsen om snel door te lopen."
        eyebrow="Kwaliteitscontrole"
        title="QC"
      />
      <EmptyState
        description="Dit scherm komt in werkpakket 3 van BUILDPLAN.md: wachtrij, bevindingen, en toetsenbord-navigatie door de rondes."
        icon={<ClipboardCheck aria-hidden="true" />}
        title="Nog niet gebouwd"
      />
    </div>
  );
}
