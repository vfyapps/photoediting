import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { readZipEntries } from "./lib/unzip.mjs";

/**
 * Genereert lib/postcode-coords.json: een gecommitte lookup-tabel
 * "LAND.POSTCODE" -> [lat, lon, plaatsnaam], gebruikt door de shootplanner-
 * kaart (BUILDPLAN-V3.md V3-WP6.2). Draai opnieuw met `node
 * scripts/generate-postcode-coords.mjs` als er ooit een land bijkomt.
 *
 * Bron: GeoNames postcode-dump (CC BY 4.0, https://www.geonames.org/),
 * gratis per land. Geen runtime-API, geen key: dit script draait eenmalig
 * tijdens ontwikkeling en het resultaat wordt gecommit, zodat de app in
 * productie geen netwerkafhankelijkheid naar een derde partij heeft.
 *
 * Landen: alle vijf landen die in de Ares-export voorkomen (AT/BE/NL/FR/DE) -
 * niet alleen de postcodes die nu al gebruikt worden, zodat een postcode uit
 * een toekomstige import ook resolvet zonder dit script opnieuw te draaien.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "lib", "postcode-coords.json");
const countries = ["AT", "BE", "NL", "FR", "DE"];

async function downloadZip(countryCode, attempts = 3) {
  const url = `https://download.geonames.org/export/zip/${countryCode}.zip`;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (attempt === attempts) throw new Error(`Download van ${url} mislukt: ${error.message}`);
      console.log(`  poging ${attempt} mislukt (${error.message}), opnieuw...`);
    }
  }
}

function parseCountryFile(text, countryCode) {
  // key -> { latSum, lonSum, count, name }
  const byPostcode = new Map();

  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const fields = line.split("\t");
    const postcode = fields[1]?.trim();
    const placeName = fields[2]?.trim();
    const lat = Number.parseFloat(fields[9]);
    const lon = Number.parseFloat(fields[10]);
    if (!postcode || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const key = `${countryCode}.${postcode}`;
    const existing = byPostcode.get(key);
    if (existing) {
      existing.latSum += lat;
      existing.lonSum += lon;
      existing.count += 1;
    } else {
      byPostcode.set(key, { latSum: lat, lonSum: lon, count: 1, name: placeName ?? "" });
    }
  }

  return byPostcode;
}

async function main() {
  const result = {};
  let total = 0;

  for (const countryCode of countries) {
    console.log(`Downloaden ${countryCode}...`);
    const zipBuffer = await downloadZip(countryCode);
    const entries = readZipEntries(zipBuffer);
    const dataEntry = entries.find((e) => e.fileName.toUpperCase() === `${countryCode}.TXT`);
    if (!dataEntry) throw new Error(`Geen ${countryCode}.txt gevonden in het zip-bestand.`);

    const text = dataEntry.data.toString("utf-8");
    const byPostcode = parseCountryFile(text, countryCode);

    for (const [key, { latSum, lonSum, count, name }] of byPostcode) {
      // Meerdere plaatsen kunnen dezelfde postcode delen (met name vooral in
      // grote steden) - het gemiddelde is een redelijke centroid voor een
      // afstandsschatting op een schaal van tientallen kilometers.
      result[key] = [
        Math.round((latSum / count) * 1000) / 1000,
        Math.round((lonSum / count) * 1000) / 1000,
        name,
      ];
    }
    console.log(`  ${byPostcode.size} unieke postcodes`);
    total += byPostcode.size;
  }

  writeFileSync(output, JSON.stringify(result));
  console.log(`\n${total} postcodes geschreven naar ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
