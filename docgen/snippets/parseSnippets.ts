import * as cheerio from "cheerio";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Prism from "prismjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../../src/routes/components");

export function parseSnippets() {
  const componentDirs = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  let snippets: Record<string, { text: string; html: string }> = {};

  for (const dir of componentDirs) {
    const dirPath = path.resolve(rootDir, dir);
    const pageFilePath = path.resolve(dirPath, "+page.svelte");

    if (fs.existsSync(pageFilePath)) {
      let fileContent = fs.readFileSync(pageFilePath, "utf8");

      const $ = cheerio.load(fileContent, { xmlMode: true });

      $("QDocsSection").each((_, element) => {
        const title = $(element).attr("title");
        const snippet = $(element).html()?.trim()?.replaceAll("      ", "");

        if (title && snippet) {
          snippets[title] = {
            text: snippet,
            html: Prism.highlight(snippet, Prism.languages.html, "html").replaceAll(
              `<span class="token attr-value"><span class="token punctuation attr-equals">=</span><span class="token punctuation">"</span><span class="token punctuation">"</span></span>`,
              ""
            ),
          };
        }
      });
    }

    let resultCode = `import Prism from "prismjs"
  
export default ${JSON.stringify(snippets)}`;

    fs.writeFileSync(path.resolve(dirPath, "docs.snippets.ts"), resultCode, "utf8");
  }
}

parseSnippets();
