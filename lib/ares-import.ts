import * as XLSX from "xlsx";

/**
 * Parsing en funnel-logica voor de Ares-import (BUILDPLAN-V3.md §V3-WP3).
 * Bewust een pure module zonder Supabase: de server action haalt de
 * bestaande acco-id's en bekende aliassen op en geeft ze hier binnen, zodat
 * dit los te testen is zonder database.
 */

const SHEET_NAME = "Data_Fototool";

const REQUIRED_COLUMNS = [
  "status",
  "priority",
  "photographer",
  "tasks",
  "rental expert",
  "acco id",
  "datum invoer",
  "sorteersleutel (hulp)",
] as const;

export type ParsedAresRow = {
  rowKey: string;
  accoId: string;
  status: string;
  priority: string;
  tasks: string[];
  photographerAlias: string;
  expertAlias: string;
  requestDateRaw: string;
};

export type ParseAresResult = { ok: true; rows: ParsedAresRow[] } | { ok: false; error: string };

function normalizeHeader(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

/**
 * Leest het tabblad Data_Fototool op kolomnaam, niet op positie: Ares kan van
 * kolomvolgorde veranderen, en dan moet de import klagen in plaats van
 * stilletjes de verkeerde velden te vullen (BUILDPLAN-V3.md §V3-WP3.2).
 */
export function parseAresWorkbook(buffer: ArrayBuffer): ParseAresResult {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    return { ok: false, error: "Het bestand kon niet worden gelezen. Is het een geldig .xlsx-bestand?" };
  }

  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    return {
      ok: false,
      error: `Tabblad "${SHEET_NAME}" niet gevonden. Aanwezige tabbladen: ${workbook.SheetNames.join(", ")}.`,
    };
  }

  const grid = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: "" });
  if (grid.length === 0) {
    return { ok: false, error: `Tabblad "${SHEET_NAME}" is leeg.` };
  }

  const headerRow = grid[0];
  const columnIndex = new Map<string, number>();
  headerRow.forEach((cell, index) => {
    const normalized = normalizeHeader(cell);
    if (normalized) columnIndex.set(normalized, index);
  });

  const missing = REQUIRED_COLUMNS.filter((name) => !columnIndex.has(name));
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Kolom(men) niet gevonden in "${SHEET_NAME}": ${missing.join(", ")}. Is de exportstructuur van Ares gewijzigd?`,
    };
  }

  const col = (name: (typeof REQUIRED_COLUMNS)[number]) => columnIndex.get(name)!;
  const rows: ParsedAresRow[] = [];

  for (let i = 1; i < grid.length; i++) {
    const row = grid[i];
    const accoId = String(row[col("acco id")] ?? "").trim();
    const rowKey = String(row[col("sorteersleutel (hulp)")] ?? "").trim();
    if (!accoId || !rowKey) continue; // lege staartrij

    rows.push({
      rowKey,
      accoId,
      status: String(row[col("status")] ?? "").trim(),
      priority: String(row[col("priority")] ?? "").trim(),
      tasks: String(row[col("tasks")] ?? "")
        .split("|")
        .map((t) => t.trim())
        .filter(Boolean),
      photographerAlias: String(row[col("photographer")] ?? "").trim(),
      expertAlias: String(row[col("rental expert")] ?? "").trim(),
      requestDateRaw: String(row[col("datum invoer")] ?? "").trim(),
    });
  }

  return { ok: true, rows };
}

const priorityMap: Record<string, "low" | "medium" | "high"> = {
  high: "high",
  medium: "medium",
  low: "low",
};

export function mapAresPriority(value: string): "low" | "medium" | "high" {
  return priorityMap[value.trim().toLowerCase()] ?? "low";
}

/** "15/01/26" -> "2026-01-15". Retourneert null als het formaat niet klopt. */
export function parseAresDate(value: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, dd, mm, yy] = match;
  const day = Number(dd);
  const month = Number(mm);
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  const year = 2000 + Number(yy);
  return `${year}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

const accoIdPattern = /^([A-Z]{2})\.([0-9A-Za-z]+)\.(\d+)$/;

/**
 * VfY-acco-id's zijn altijd LAND.POSTCODE.NR (BUILDPLAN-V3.md V3-WP6, vooraf
 * gemeten op 954/954 acco-id's). Gebruikt voor zowel ares_shoots (land/
 * postcode-kolommen) als de kaart (postcode -> coördinaten).
 */
export function parseAccoId(accoId: string): { land: string; postcode: string; number: string } | null {
  const match = accoIdPattern.exec(accoId.trim());
  if (!match) return null;
  const [, land, postcode, number] = match;
  return { land, postcode, number };
}

export type ImportCandidateGroup = "new" | "existing" | "winter_overlap" | "problem";

export type ImportCandidate = {
  rowKey: string;
  accoId: string;
  priority: "low" | "medium" | "high";
  expertAlias: string;
  requestDate: string | null;
  group: ImportCandidateGroup;
  problem: string | null;
};

export type ImportFunnelResult = {
  candidates: ImportCandidate[];
  ignoredNonAt: number;
  ignoredNotQualifying: number;
};

/**
 * Past de kandidaatregel toe (BUILDPLAN-V3.md beslispunt E: alleen AT) en
 * verdeelt het resultaat in de vier groepen uit de importpreview. Eén
 * kandidaat per acco-id: bij meerdere kwalificerende rijen voor dezelfde
 * woning wint de eerste (stabiele volgorde uit het bronbestand).
 */
export function buildAresImportCandidates({
  rows,
  existingAccoIds,
  knownAliases,
  historicalWinterAccoIds,
}: {
  rows: ParsedAresRow[];
  existingAccoIds: ReadonlySet<string>;
  knownAliases: ReadonlySet<string>;
  /**
   * Acco-id's met een winter-regel uit eerdere imports (ares_shoots), niet
   * alleen uit het huidige bestand - anders mist de overlapcheck een woning
   * waarvan de winter-shoot vorige maand al uit de "open"-export is gevallen
   * (BUILDPLAN-V3.md V3-WP6.1, "bijvangst"). Optioneel zodat bestaande
   * aanroepen/tests zonder database-context blijven werken.
   */
  historicalWinterAccoIds?: ReadonlySet<string>;
}): ImportFunnelResult {
  let ignoredNonAt = 0;
  let ignoredNotQualifying = 0;

  const winterAccoIds = new Set([
    ...rows.filter((r) => r.tasks.includes("ExteriorWinter")).map((r) => r.accoId),
    ...(historicalWinterAccoIds ?? []),
  ]);

  const seenAccoIds = new Set<string>();
  const candidates: ImportCandidate[] = [];

  for (const row of rows) {
    if (!row.accoId.startsWith("AT.")) {
      ignoredNonAt++;
      continue;
    }
    const qualifies =
      row.status === "Completed" && row.tasks.includes("ExteriorSummer") && !row.tasks.includes("ExteriorWinter");
    if (!qualifies) {
      ignoredNotQualifying++;
      continue;
    }
    if (seenAccoIds.has(row.accoId)) continue; // al gekozen via een eerdere rij voor dezelfde woning
    seenAccoIds.add(row.accoId);

    const priority = mapAresPriority(row.priority);
    const requestDate = parseAresDate(row.requestDateRaw);
    const aliasKnown = knownAliases.has(row.expertAlias.trim().toLowerCase());

    let group: ImportCandidateGroup;
    let problem: string | null = null;

    if (existingAccoIds.has(row.accoId)) {
      group = "existing";
    } else if (winterAccoIds.has(row.accoId)) {
      group = "winter_overlap";
    } else if (!aliasKnown) {
      group = "problem";
      problem = `Onbekende verhuurexpert-alias "${row.expertAlias}". Koppel deze eerst.`;
    } else if (!requestDate) {
      group = "problem";
      problem = `Datum "${row.requestDateRaw}" is niet leesbaar (verwacht dd/mm/jj).`;
    } else {
      group = "new";
    }

    candidates.push({
      rowKey: row.rowKey,
      accoId: row.accoId,
      priority,
      expertAlias: row.expertAlias,
      requestDate,
      group,
      problem,
    });
  }

  return { candidates, ignoredNonAt, ignoredNotQualifying };
}
