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
