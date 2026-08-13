/**
 * Zod-schema's voor de server actions. Ze staan hier en niet in het
 * "use server"-bestand zelf, omdat een module met "use server" alleen async
 * functies mag exporteren - een schema erin is dus niet los te testen, en
 * Definition of done vraagt precies dat.
 */

import { z } from "zod";

const assignmentIdsSchema = z
  .array(z.string().uuid("Ongeldig opdracht-ID"))
  .min(1, "Selecteer ten minste één opdracht")
  .max(500, "Selecteer maximaal 500 opdrachten tegelijk");

export const bulkActionSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("assign"),
    assignmentIds: assignmentIdsSchema,
    editorId: z.string().uuid("Selecteer een geldige editor"),
  }),
  z.object({
    operation: z.literal("priority"),
    assignmentIds: assignmentIdsSchema,
    priority: z.enum(["low", "medium", "high"], {
      error: "Selecteer een geldige prioriteit",
    }),
  }),
]);

export type BulkAction = z.infer<typeof bulkActionSchema>;

export const addEditItemsSchema = z.object({
  assignmentId: z.string().uuid("Ongeldig opdracht-ID"),
  goalCode: z.string().min(1, "Selecteer een editing goal"),
  photoNumbers: z
    .array(z.number().int().positive("Fotonummer moet groter zijn dan 0"))
    .min(1, "Voer minstens één fotonummer in"),
});

export const deleteEditItemSchema = z.object({
  editItemId: z.string().uuid("Ongeldig foto-ID"),
});

export const updateMagnificUrlSchema = z.object({
  assignmentId: z.string().uuid("Ongeldig opdracht-ID"),
  magnificUrl: z.union([z.literal(""), z.url("Voer een geldige URL in")]),
});

const qcFindingSchema = z
  .object({
    photoNumber: z.number().int().positive().nullable(),
    issueCode: z.string().min(1, "Kies een categorie voor elke bevinding"),
    comment: z.string().trim().max(2000).nullable(),
  })
  .refine((finding) => finding.issueCode !== "other" || Boolean(finding.comment?.trim()), {
    message: "Categorie 'Overig' vereist een toelichting",
    path: ["comment"],
  });

export const submitQcReviewSchema = z.object({
  assignmentId: z.string().uuid("Ongeldig opdracht-ID"),
  decision: z.enum(["approved", "denied"], { error: "Ongeldige beslissing" }),
  findings: z.array(qcFindingSchema).max(50, "Maximaal 50 bevindingen per ronde"),
});

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const upsertGuidelineSchema = z.object({
  id: z.string().uuid().nullable(),
  slug: z
    .string()
    .trim()
    .min(3, "Slug moet minstens 3 tekens zijn")
    .max(150)
    .regex(slugPattern, "Slug mag alleen kleine letters, cijfers en koppeltekens bevatten"),
  title: z.string().trim().min(1, "Titel is verplicht").max(200),
  track: z.enum(["onboarding", "goal", "tips"], { error: "Kies een track" }),
  goalCode: z.string().nullable(),
  bodyMd: z.string().trim().min(1, "De inhoud mag niet leeg zijn"),
  isPublished: z.boolean(),
  sortOrder: z.number().int(),
});

export const markGuidelineReadSchema = z.object({
  guidelineId: z.string().uuid("Ongeldige module"),
});
