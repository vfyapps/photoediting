import { describe, expect, it } from "vitest";

import { buildAresImportCandidates, mapAresPriority, parseAresDate, type ParsedAresRow } from "@/lib/ares-import";

function row(overrides: Partial<ParsedAresRow>): ParsedAresRow {
  return {
    rowKey: "1",
    accoId: "AT.0000.00",
    status: "Completed",
    priority: "Medium",
    tasks: ["ExteriorSummer"],
    expertAlias: "daniel",
    requestDateRaw: "15/01/26",
    ...overrides,
  };
}

describe("parseAresDate", () => {
  it("zet dd/mm/jj om naar ISO", () => {
    expect(parseAresDate("15/01/26")).toBe("2026-01-15");
  });

  it("geeft null bij een onleesbaar formaat", () => {
    expect(parseAresDate("13.1")).toBeNull();
    expect(parseAresDate("")).toBeNull();
    expect(parseAresDate("32/01/26")).toBeNull();
  });
});

describe("mapAresPriority", () => {
  it("mapt de bekende waarden en valt terug op low", () => {
    expect(mapAresPriority("High")).toBe("high");
    expect(mapAresPriority("Medium")).toBe("medium");
    expect(mapAresPriority("Low")).toBe("low");
    expect(mapAresPriority("?")).toBe("low");
    expect(mapAresPriority("")).toBe("low");
  });
});

describe("buildAresImportCandidates", () => {
  const knownAliases = new Set(["daniel"]);

  it("kwalificeert alleen Completed + ExteriorSummer zonder ExteriorWinter, binnen AT", () => {
    const result = buildAresImportCandidates({
      rows: [
        row({ accoId: "AT.0001.01", status: "Completed", tasks: ["ExteriorSummer"] }),
        row({ accoId: "AT.0001.02", status: "Assigned", tasks: ["ExteriorSummer"] }), // niet Completed
        row({ accoId: "AT.0001.03", status: "Completed", tasks: ["ExteriorSummer", "ExteriorWinter"] }), // heeft al winter op dezelfde rij
        row({ accoId: "BE.0001.04", status: "Completed", tasks: ["ExteriorSummer"] }), // niet AT
      ],
      existingAccoIds: new Set(),
      knownAliases,
    });

    expect(result.candidates.map((c) => c.accoId)).toEqual(["AT.0001.01"]);
    expect(result.ignoredNonAt).toBe(1);
    expect(result.ignoredNotQualifying).toBe(2);
  });

  it("groepeert 'existing' op basis van al bestaande acco-id's", () => {
    const result = buildAresImportCandidates({
      rows: [row({ accoId: "AT.0002.01" })],
      existingAccoIds: new Set(["AT.0002.01"]),
      knownAliases,
    });
    expect(result.candidates[0]?.group).toBe("existing");
  });

  it("groepeert 'winter_overlap' als de acco-id elders al een winter-regel heeft", () => {
    const result = buildAresImportCandidates({
      rows: [
        row({ accoId: "AT.0003.01", rowKey: "1" }),
        row({ accoId: "AT.0003.01", rowKey: "2", status: "Assigned", tasks: ["ExteriorWinter"] }),
      ],
      existingAccoIds: new Set(),
      knownAliases,
    });
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]?.group).toBe("winter_overlap");
  });

  it("groepeert 'problem' bij een onbekende expert-alias", () => {
    const result = buildAresImportCandidates({
      rows: [row({ accoId: "AT.0004.01", expertAlias: "onbekend" })],
      existingAccoIds: new Set(),
      knownAliases,
    });
    expect(result.candidates[0]?.group).toBe("problem");
    expect(result.candidates[0]?.problem).toMatch(/onbekend/i);
  });

  it("groepeert 'problem' bij een onleesbare datum", () => {
    const result = buildAresImportCandidates({
      rows: [row({ accoId: "AT.0005.01", requestDateRaw: "13.1" })],
      existingAccoIds: new Set(),
      knownAliases,
    });
    expect(result.candidates[0]?.group).toBe("problem");
    expect(result.candidates[0]?.problem).toMatch(/datum/i);
  });

  it("neemt bij meerdere kwalificerende rijen voor dezelfde woning alleen de eerste", () => {
    const result = buildAresImportCandidates({
      rows: [
        row({ accoId: "AT.0006.01", rowKey: "eerste" }),
        row({ accoId: "AT.0006.01", rowKey: "tweede" }),
      ],
      existingAccoIds: new Set(),
      knownAliases,
    });
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]?.rowKey).toBe("eerste");
  });

  it("groepeert 'new' zodra alles klopt", () => {
    const result = buildAresImportCandidates({
      rows: [row({ accoId: "AT.0007.01" })],
      existingAccoIds: new Set(),
      knownAliases,
    });
    expect(result.candidates[0]?.group).toBe("new");
    expect(result.candidates[0]?.requestDate).toBe("2026-01-15");
    expect(result.candidates[0]?.priority).toBe("medium");
  });
});
