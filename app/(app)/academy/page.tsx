import { GraduationCap } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function AcademyPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Onboarding, modules per editing goal, de promptbibliotheek en tips."
        eyebrow="Kennisbank"
        title="Academy"
      />
      <EmptyState
        description="Dit scherm komt in werkpakket 5 van BUILDPLAN.md: drie tracks, promptbibliotheek en eigen voortgang."
        icon={<GraduationCap aria-hidden="true" />}
        title="Nog niet gebouwd"
      />
    </div>
  );
}
