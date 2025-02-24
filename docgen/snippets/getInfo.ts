import { readFile } from "fs/promises";
import pathExists from "../helpers/pathExists.js";
import generateHash from "../helpers/generateHash.js";
import extractHash from "../helpers/extractHash.js";
import parseSvelteFile from "./parseSvelteFile.js";
import type { SnippetSection } from "./parseSvelteFile.js";

type InfoObject = {
  needsToBeGenerated: boolean;
  hashSections?: string;
  sections?: SnippetSection[];
};

function stringifySectionsForHash(sections: Record<string, string>[]) {
  return JSON.stringify(sections);
}

export default async function getInfo(
  pageFilePath: string,
  docsSnippetsFilePath: string
): Promise<InfoObject> {
  if (!(await pathExists(pageFilePath))) {
    return { needsToBeGenerated: false };
  }

  const sections = await parseSvelteFile(pageFilePath);
  const hashSections = generateHash(stringifySectionsForHash(sections));

  if (!(await pathExists(docsSnippetsFilePath))) {
    return { needsToBeGenerated: true, hashSections, sections };
  }

  const hashFromDocsProps = extractHash(await readFile(docsSnippetsFilePath, "utf8"));
  const needsToBeGenerated = hashSections !== hashFromDocsProps;

  return { needsToBeGenerated, hashSections, sections };
}
