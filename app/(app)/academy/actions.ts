"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { markGuidelineReadSchema, upsertGuidelineSchema } from "@/lib/validation";

export type AcademyActionResult =
  | { ok: true; slug?: string }
  | { ok: false; message: string };

export async function markGuidelineRead(guidelineId: string): Promise<AcademyActionResult> {
  const parsed = markGuidelineReadSchema.safeParse({ guidelineId });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige aanvraag" };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return { ok: false, message: "Je bent niet ingelogd." };

  const { error } = await supabase
    .from("academy_reads")
    .upsert(
      { user_id: userId, guideline_id: parsed.data.guidelineId },
      { onConflict: "user_id,guideline_id", ignoreDuplicates: true },
    );

  if (error) {
    return { ok: false, message: "Kon niet als gelezen markeren. Probeer opnieuw." };
  }

  revalidatePath("/academy");
  return { ok: true };
}

/**
 * Maakt of wijzigt een module. Alleen coordinator/admin — RLS
 * (write_guidelines) is de echte grens, deze action geeft alleen een
 * nette Nederlandse foutmelding in plaats van een kale 42501.
 */
export async function upsertGuideline(input: {
  id: string | null;
  slug: string;
  title: string;
  track: "onboarding" | "goal" | "tips";
  goalCode: string | null;
  bodyMd: string;
  isPublished: boolean;
  sortOrder: number;
}): Promise<AcademyActionResult> {
  const parsed = upsertGuidelineSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();
  const payload = {
    slug: parsed.data.slug,
    title: parsed.data.title,
    track: parsed.data.track,
    goal_code: parsed.data.goalCode,
    body_md: parsed.data.bodyMd,
    is_published: parsed.data.isPublished,
    sort_order: parsed.data.sortOrder,
  };

  const { data, error } = parsed.data.id
    ? await supabase.from("guidelines").update(payload).eq("id", parsed.data.id).select("slug").single()
    : await supabase.from("guidelines").insert(payload).select("slug").single();

  if (error || !data) {
    return {
      ok: false,
      message:
        error?.code === "42501"
          ? "Alleen de coördinator kan modules bewerken."
          : error?.code === "23505"
            ? "Er bestaat al een module met deze slug."
            : "De module kon niet worden opgeslagen. Probeer opnieuw.",
    };
  }

  revalidatePath("/academy");
  revalidatePath(`/academy/${data.slug}`);
  return { ok: true, slug: data.slug };
}
