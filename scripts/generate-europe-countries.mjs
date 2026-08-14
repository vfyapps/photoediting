import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json" with { type: "json" };

/**
 * Genereert lib/europe-countries.json: platte GeoJSON-omtrekken van de vijf
 * landen op de shootplanner-kaart (BUILDPLAN-V3.md V3-WP6.6), uit de
 * Natural Earth 1:110m-set via het world-atlas-devDependency-pakket. Draai
 * opnieuw met `node scripts/generate-europe-countries.mjs` als er ooit een
 * land bijkomt. Alleen GeoJSON in de app zelf - topojson-client blijft een
 * devDependency, geen runtime-afhankelijkheid.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "lib", "europe-countries.json");

// ISO 3166-1 numeric, zoals world-atlas ze als feature-id gebruikt.
const isoNumericCodes = {
  "040": "AT",
  "056": "BE",
  "276": "DE",
  "250": "FR",
  "528": "NL",
};

const collection = feature(worldAtlas, worldAtlas.objects.countries);
const wanted = collection.features
  .filter((f) => f.id in isoNumericCodes)
  .map((f) => ({ ...f, properties: { land: isoNumericCodes[f.id] } }));

if (wanted.length !== Object.keys(isoNumericCodes).length) {
  throw new Error(`Verwachtte ${Object.keys(isoNumericCodes).length} landen, vond er ${wanted.length}.`);
}

writeFileSync(output, JSON.stringify({ type: "FeatureCollection", features: wanted }));
console.log(`${wanted.length} landen geschreven naar ${output}`);
