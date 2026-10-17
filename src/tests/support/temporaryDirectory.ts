import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { onTestFinished } from "vitest";

/** Creates a temporary directory that is removed after the current test. */
export async function createTemporaryDirectory(name: string) {
  const directory = await mkdtemp(join(tmpdir(), `quaff-${name}-`));
  onTestFinished(() => removeDirectory(directory));

  return directory;
}

export function removeDirectory(directory: string) {
  return rm(directory, { recursive: true, force: true });
}
