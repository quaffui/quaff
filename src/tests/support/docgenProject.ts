import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createTemporaryDirectory } from "./temporaryDirectory";

// Docgen hashes this project configuration into its cache keys.
const PROJECT_FILES = { ".prettierrc": "{}", "bun.lock": "{}", "package.json": "{}" };

/** Creates a temporary docgen project root, removed after the current test. */
export async function createDocgenProject(name: string, files: Record<string, string>) {
  const root = await createTemporaryDirectory(name);
  await writeProjectFiles(root, { ...PROJECT_FILES, ...files });

  return root;
}

export async function writeProjectFiles(root: string, files: Record<string, string>) {
  await Promise.all(
    Object.entries(files).map(async ([name, contents]) => {
      const destination = join(root, name);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, contents);
    })
  );
}
