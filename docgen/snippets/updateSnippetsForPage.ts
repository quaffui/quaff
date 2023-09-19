import { writeFile } from "fs/promises";
import path from "path";
import formatCodeAndAddHash from "../helpers/formatCodeAndAddHash.js";
import getInfo from "./getInfo.js";

export default async function updateSnippetsForPage(pageFilePath: string) {
  const dirPath = path.dirname(pageFilePath);
  const docsSnippetsFilePath = path.resolve(dirPath, "docs.snippets.ts");

  const snippets: Record<string, string> = {};
  const { needsToBeGenerated, hashSections, sections } = await getInfo(
    pageFilePath,
    docsSnippetsFilePath
  );

  if (needsToBeGenerated && sections) {
    sections.forEach(({ title, content }) => {
      snippets[title] = content;
    });

    const code = `export default ${JSON.stringify(snippets)}`;
    const formattedCode = await formatCodeAndAddHash(code, hashSections!);

    await writeFile(docsSnippetsFilePath, formattedCode, "utf8");
  }
}
