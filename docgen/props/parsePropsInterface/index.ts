import path from "node:path";
import { Project } from "ts-morph";

import { extractInterfaces } from "./extractor";
import { parseInterface } from "./parser";

const tsConfigFilePath = path.join(__dirname, "../../../tsconfig.json");

// Avoids creating a new Project instance for every file, which is very
// slow and unnecessary since all files use the same tsconfig.
let cachedProject: Project | null = null;

export async function parseInterfaces(filePath: string) {
  if (!cachedProject) {
    cachedProject = new Project({ tsConfigFilePath });
  } else {
    // Force a file refresh to ensure we are parsing the latest changes in memory
    cachedProject.getSourceFile(filePath)?.refreshFromFileSystemSync();
  }

  const interfaces = extractInterfaces(cachedProject, filePath);

  const parsed = await Promise.all(interfaces.map(parseInterface));

  return Object.fromEntries(parsed);
}
