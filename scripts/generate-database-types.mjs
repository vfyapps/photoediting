import { renameSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "lib", "database.types.ts");
const temporaryOutput = `${output}.tmp`;
const mode = process.argv[2];

if (mode !== "--linked" && mode !== "--local") {
  console.error("Gebruik --linked of --local.");
  process.exit(1);
}

const executable = process.platform === "win32" ? "supabase.cmd" : "supabase";
const useShell = process.platform === "win32";
const result = spawnSync(
  executable,
  ["gen", "types", mode, "--lang", "typescript", "--schema", "public"],
  {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    shell: useShell,
  },
);

if (result.error || result.status !== 0) {
  console.error(
    result.stderr?.trim() ||
      result.stdout?.trim() ||
      result.error?.message ||
      "Typegeneratie is mislukt.",
  );
  process.exit(result.status ?? 1);
}

writeFileSync(temporaryOutput, result.stdout, "utf8");
renameSync(temporaryOutput, output);
console.log("Supabase-types geschreven naar lib/database.types.ts");
