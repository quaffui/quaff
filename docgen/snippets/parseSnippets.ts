import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../../src/routes/components");

function parseSvelteFile(svelteFilePath: string) {
  const fileContent = fs.readFileSync(svelteFilePath, "utf-8");
  const qdocsectionPattern = /<QDocsSection[^>]*?title="(.*?)">(.*?)<\/QDocsSection>/gs;

  let match;
  const sections: Array<{ title: string; content: string }> = [];

  while ((match = qdocsectionPattern.exec(fileContent)) !== null) {
    const title = match[1];
    const content = match[2].trim();
    sections.push({ title, content });
  }

  match = null;

  return sections.map(({ title, content }) => {
    return {
      title,
      content: content.replaceAll("      ", ""),
    };
  });
}

export function parseSnippets() {
  const componentsToIgnore = ["layout"];

  const componentDirs = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && !componentsToIgnore.includes(dirent.name))
    .map((dirent) => dirent.name);

  for (const dir of componentDirs) {
    const dirPath = path.resolve(rootDir, dir);
    const pageFilePath = path.resolve(dirPath, "+page.svelte");

    const snippets: Record<string, string> = {};

    if (fs.existsSync(pageFilePath)) {
      const sections = parseSvelteFile(pageFilePath);

      sections.forEach(({ title, content }) => {
        snippets[title] = content;
      });
    }

    const resultCode = `export default ${JSON.stringify(snippets)}`;

    fs.writeFileSync(path.resolve(dirPath, "docs.snippets.ts"), resultCode, "utf8");
  }
}

parseSnippets();
