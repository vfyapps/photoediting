import { redirect } from "next/navigation";

import { MapScreen } from "@/components/kaart/map-screen";
import { clusterShoots, resolvePhotographers } from "@/lib/shoot-map";
import { getCurrentUser } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function KaartPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "coordinator")) {
    redirect("/");
  }

  const supabase = await createClient();
  const [{ data: shoots }, { data: photographers }] = await Promise.all([
    supabase.from("ares_shoots").select("acco_id, status, photographer_alias, expert_alias"),
    supabase.from("photographers").select("id, name, ares_alias, land, postcode").eq("is_active", true),
  ]);

  const clusters = clusterShoots(shoots ?? []);
  const photographerPoints = resolvePhotographers(photographers ?? []);
  const totalShoots = shoots?.length ?? 0;
  const unresolvedCount = totalShoots - clusters.reduce((sum, c) => sum + c.shoots.length, 0);

  return (
    <MapScreen clusters={clusters} photographers={photographerPoints} unresolvedCount={unresolvedCount} />
  );
}
