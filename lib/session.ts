import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  fullName: string;
  email: string | null;
  role: "admin" | "coordinator" | "editor" | "viewer";
  editorName: string | null;
};

/**
 * Eigen rij uit app_users, altijd leesbaar door RLS (read_app_users_scoped
 * laat iedereen de eigen id lezen). Retourneert null als er geen sessie is
 * of nog geen app_users-rij bestaat (proxy.ts stuurt dat geval al naar
 * /login voordat een pagina dit ooit hoeft af te handelen).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (!userId) return null;

  const [{ data: profile }, { data: editor }] = await Promise.all([
    supabase
      .from("app_users")
      .select("id, full_name, email, role")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("editors")
      .select("name")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (!profile) return null;

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    editorName: editor?.name ?? null,
  };
}
