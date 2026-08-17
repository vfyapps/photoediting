import { redirect } from "next/navigation";

import { BeheerTabs } from "@/components/beheer/beheer-tabs";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";
// Expliciet Node, geen edge: de admin-serveracties gebruiken de service-role
// key en die hoort niet in een edge-bundle terecht te komen (BUILDPLAN-V3.md
// §5.3).
export const runtime = "nodejs";

export default async function BeheerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "coordinator")) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <BeheerTabs />
      {children}
    </div>
  );
}
