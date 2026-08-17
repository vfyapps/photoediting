"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  deleteGuidelineExampleSchema,
  markGuidelineReadSchema,
  upsertGuidelineSchema,
  uploadGuidelineExampleSchema,
} from "@/lib/validation";

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

// De "Gelezen"-knop is een toggle, geen eenrichtings-checkbox: een editor
// mag een module weer op ongelezen zetten (BUILDPLAN-V4 §WP6.4).
export async function unmarkGuidelineRead(guidelineId: string): Promise<AcademyActionResult> {
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
    .delete()
    .eq("user_id", userId)
    .eq("guideline_id", parsed.data.guidelineId);

  if (error) {
    return { ok: false, message: "Kon niet als ongelezen markeren. Probeer opnieuw." };
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

const mimeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Uploadt een goed/fout-voorbeeld bij een module. Zowel de bucket-policy
 * (write_guideline_objects) als deze action controleren op coordinator/admin
 * - de action geeft alleen de nette Nederlandse melding.
 */
export async function uploadGuidelineExample(input: {
  guidelineId: string;
  isGood: boolean;
  caption: string | null;
  file: File;
}): Promise<AcademyActionResult> {
  const parsed = uploadGuidelineExampleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const supabase = await createClient();

  const { data: guideline } = await supabase
    .from("guidelines")
    .select("slug")
    .eq("id", parsed.data.guidelineId)
    .maybeSingle();
  if (!guideline) return { ok: false, message: "Module niet gevonden." };

  const { count } = await supabase
    .from("guideline_examples")
    .select("id", { count: "exact", head: true })
    .eq("guideline_id", parsed.data.guidelineId);

  const extension = mimeExtensions[parsed.data.file.type] ?? "jpg";
  const storagePath = `${parsed.data.guidelineId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("guidelines")
    .upload(storagePath, parsed.data.file, { contentType: parsed.data.file.type });
  if (uploadError) {
    return {
      ok: false,
      message:
        uploadError.message.includes("row-level security") || uploadError.message.includes("policy")
          ? "Alleen de coördinator kan lesmateriaal uploaden."
          : "De afbeelding kon niet worden geüpload. Probeer opnieuw.",
    };
  }

  const { error: insertError } = await supabase.from("guideline_examples").insert({
    guideline_id: parsed.data.guidelineId,
    storage_path: storagePath,
    caption: parsed.data.caption,
    is_good: parsed.data.isGood,
    sort_order: count ?? 0,
  });
  if (insertError) {
    await supabase.storage.from("guidelines").remove([storagePath]);
    return { ok: false, message: "De afbeelding is geüpload maar kon niet worden gekoppeld. Probeer opnieuw." };
  }

  revalidatePath(`/academy/${guideline.slug}/bewerken`);
  revalidatePath(`/academy/${guideline.slug}`);
  return { ok: true };
}

/**
 * Verwijdert zowel het bestand in Storage als de rij - anders lekt de bucket
 * vol met bestanden zonder verwijzing.
 */
export async function deleteGuidelineExample(exampleId: string): Promise<AcademyActionResult> {
  const parsed = deleteGuidelineExampleSchema.safeParse({ exampleId });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Ongeldige aanvraag" };
  }

  const supabase = await createClient();

  const { data: example } = await supabase
    .from("guideline_examples")
    .select("storage_path, guidelines(slug)")
    .eq("id", parsed.data.exampleId)
    .maybeSingle();
  if (!example) return { ok: false, message: "Voorbeeld niet gevonden." };

  await supabase.storage.from("guidelines").remove([example.storage_path]);

  const { error } = await supabase.from("guideline_examples").delete().eq("id", parsed.data.exampleId);
  if (error) {
    return {
      ok: false,
      message: error.code === "42501" ? "Alleen de coördinator kan lesmateriaal verwijderen." : "Verwijderen mislukt. Probeer opnieuw.",
    };
  }

  const slug = (example.guidelines as { slug: string } | null)?.slug;
  if (slug) {
    revalidatePath(`/academy/${slug}/bewerken`);
    revalidatePath(`/academy/${slug}`);
  }
  return { ok: true };
}
