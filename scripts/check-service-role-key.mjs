import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Permanente vangrail (BUILDPLAN-V3.md V3-WP8, amendement V3-WP2 in
 * AGENTS.md): SUPABASE_SERVICE_ROLE_KEY mag maar op één plek voorkomen in de
 * app-code, lib/supabase/admin.ts, en nooit met een NEXT_PUBLIC_-prefix (dat
 * zou hem in de browserbundel zetten). Draait als onderdeel van `npm run
 * verify` - een preview-deploy zonder de key moet blijven werken (zie
 * README), maar de key zelf mag nooit ergens anders vandaan gelezen worden.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scanDirs = ["app", "components", "lib"];
const allowedFile = "lib/supabase/admin.ts";
const skipDirs = new Set(["node_modules", ".next", ".git"]);
const sourceExtensions = new Set([".ts", ".tsx"]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (sourceExtensions.has(entry.slice(entry.lastIndexOf(".")))) files.push(full);
  }
  return files;
}

let violations = [];

for (const dir of scanDirs) {
  const absDir = join(root, dir);
  let files;
  try {
    files = walk(absDir);
  } catch {
    continue;
  }

  for (const file of files) {
    const relPath = relative(root, file).replace(/\\/g, "/");
    const text = readFileSync(file, "utf-8");

    if (/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/.test(text)) {
      violations.push(`${relPath}: NEXT_PUBLIC_-prefixed service-role key reference (zou in de browserbundel komen)`);
      continue;
    }

    // Elke referentie naar de key-naam zelf, behalve het sentinel-woord
    // "SUPABASE_SERVICE_ROLE_KEY_MISSING" dat lib/supabase/admin.ts gooit en
    // andere bestanden mogen vergelijken (zie friendlyAdminError()).
    const withoutSentinel = text.replace(/SUPABASE_SERVICE_ROLE_KEY_MISSING/g, "");
    if (/SUPABASE_SERVICE_ROLE_KEY/.test(withoutSentinel) && relPath.replace(/\\/g, "/") !== allowedFile.replace(/\\/g, "/")) {
      violations.push(`${relPath}: referentie naar SUPABASE_SERVICE_ROLE_KEY buiten ${allowedFile}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Service-role-key vangrail gefaald:\n");
  for (const v of violations) console.error(`  - ${v}`);
  console.error(`\nAlleen ${allowedFile} mag SUPABASE_SERVICE_ROLE_KEY lezen (AGENTS.md, amendement V3-WP2).`);
  process.exit(1);
}

console.log(`Service-role-key vangrail OK: alleen ${allowedFile.replace(/\\/g, "/")} refereert aan de key.`);
