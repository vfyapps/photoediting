import { SettingsScreen } from "@/components/beheer/settings-screen";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const fieldOrder = [
  "qc_reminder_days",
  "max_photos_per_property",
  "qc_issue_callout_threshold",
  "magnific_base_url",
  "ares_base_url",
] as const;

export default async function BeheerInstellingenPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("app_settings").select("key, value, description");

  const byKey = new Map((settings ?? []).map((s) => [s.key, s]));
  const ordered = fieldOrder
    .map((key) => byKey.get(key))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return <SettingsScreen settings={ordered} />;
}
