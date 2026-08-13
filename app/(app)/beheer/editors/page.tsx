import { EditorsExpertsScreen } from "@/components/beheer/editors-experts-screen";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BeheerEditorsPage() {
  const supabase = await createClient();
  const [{ data: editors }, { data: experts }, { data: users }] = await Promise.all([
    supabase.from("editors").select("id, name, user_id, is_active").order("name"),
    supabase.from("rental_experts").select("id, name, email, country, is_active").order("name"),
    supabase.from("app_users").select("id, full_name").order("full_name"),
  ]);

  return (
    <EditorsExpertsScreen
      editors={editors ?? []}
      experts={experts ?? []}
      users={(users ?? []).map((u) => ({ id: u.id, fullName: u.full_name }))}
    />
  );
}
