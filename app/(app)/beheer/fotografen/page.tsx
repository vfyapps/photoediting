import { PhotographersScreen } from "@/components/beheer/photographers-screen";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BeheerFotografenPage() {
  const supabase = await createClient();
  const { data: photographers } = await supabase
    .from("photographers")
    .select("id, name, ares_alias, land, postcode, is_active")
    .order("name");

  return <PhotographersScreen photographers={photographers ?? []} />;
}
