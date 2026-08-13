/**
 * Simpele, dependency-vrije CSV-serialisatie voor de export-knoppen op het
 * dashboard. RFC 4180-achtig: dubbele aanhalingstekens escapen, velden met
 * komma/aanhalingsteken/regeleinde quoten.
 */
export function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvField(row[header])).join(","));
  }
  return lines.join("\r\n");
}

function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
