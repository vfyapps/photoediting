import { describe, expect, it } from "vitest";

import { bulkActionSchema } from "@/lib/validation";

const uuid = "3f6d3b8e-4b21-4a2f-9d2e-1f7b0c9a5e11";
const otherUuid = "b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e";

describe("bulkActionSchema", () => {
  it("accepteert een toewijzing aan een editor", () => {
    const result = bulkActionSchema.safeParse({
      operation: "assign",
      assignmentIds: [uuid],
      editorId: otherUuid,
    });

    expect(result.success).toBe(true);
  });

  it("accepteert een prioriteitswijziging", () => {
    const result = bulkActionSchema.safeParse({
      operation: "priority",
      assignmentIds: [uuid, otherUuid],
      priority: "high",
    });

    expect(result.success).toBe(true);
  });

  it("weigert een lege selectie", () => {
    const result = bulkActionSchema.safeParse({
      operation: "priority",
      assignmentIds: [],
      priority: "low",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Selecteer ten minste één opdracht");
  });

  it("weigert meer dan 500 opdrachten tegelijk", () => {
    const result = bulkActionSchema.safeParse({
      operation: "priority",
      assignmentIds: Array.from({ length: 501 }, () => uuid),
      priority: "low",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Selecteer maximaal 500 opdrachten tegelijk");
  });

  it("weigert een ID dat geen uuid is", () => {
    const result = bulkActionSchema.safeParse({
      operation: "priority",
      assignmentIds: ["AT.6364.53"],
      priority: "low",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Ongeldig opdracht-ID");
  });

  it("weigert een onbekende prioriteit", () => {
    const result = bulkActionSchema.safeParse({
      operation: "priority",
      assignmentIds: [uuid],
      priority: "urgent",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Selecteer een geldige prioriteit");
  });

  it("weigert een onbekende operatie", () => {
    const result = bulkActionSchema.safeParse({
      operation: "delete",
      assignmentIds: [uuid],
    });

    expect(result.success).toBe(false);
  });

  it("geeft Nederlandse meldingen, geen Zod-standaardtekst", () => {
    const result = bulkActionSchema.safeParse({
      operation: "assign",
      assignmentIds: [uuid],
      editorId: "niemand",
    });

    expect(result.error?.issues[0]?.message).toBe("Selecteer een geldige editor");
  });
});
