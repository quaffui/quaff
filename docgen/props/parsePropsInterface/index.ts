import path from "node:path";
import { Project } from "ts-morph";

import { extractInterfaces } from "./extractor";
import { parseInterface } from "./parser";

export * from "./defs";

const tsConfigFilePath = path.join(__dirname, "../../../tsconfig.json");

export function parseInterfaces(filePath: string) {
  const project = new Project({ tsConfigFilePath });

  const interfaces = extractInterfaces(project, filePath);

  const parsed = interfaces.map(parseInterface);

  return Object.fromEntries(parsed);
}
