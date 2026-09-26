import { glob, readFile, unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const GENERATED_HEADER = "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE";
const OUTPUT_PATTERNS = [
  "src/lib/components/**/docs{,.props}.ts",
  "src/routes/components/**/docs.snippets.ts",
];
let removedCount = 0;

for await (const relativePath of glob(OUTPUT_PATTERNS, { cwd: PROJECT_ROOT })) {
  const file = path.join(PROJECT_ROOT, relativePath);
  const source = await readFile(file, "utf8");

  if (!source.startsWith(GENERATED_HEADER)) {
    continue;
  }

  await unlink(file);
  removedCount++;
}

console.info(`Removed ${removedCount} generated docgen files.`);
