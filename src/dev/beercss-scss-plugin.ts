import { access, readFile, writeFile } from "fs/promises";
import path from "path";

const headerComment = `/**
 * This file is auto generated. It's just the beercss css file as .scss, so we can use Sass's @extend.
 */
`;

async function fileExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export default function beercssScssPlugin() {
  return {
    name: "beercss-scss-plugin",
    async configResolved(config) {
      const cssFilePath = path.join(
        config.root,
        "node_modules",
        "beercss",
        "dist",
        "cdn",
        "beer.min.css"
      );

      const cssContent = await readFile(cssFilePath, "utf-8");

      const targetPath = path.join(config.root, "src", "lib", "css", "beer.min.lib.scss");
      const newFileContent = [headerComment, cssContent].join("\n");

      const oldFileContent = (await fileExists(targetPath))
        ? await readFile(targetPath, "utf-8")
        : null;

      if (!oldFileContent || oldFileContent !== newFileContent) {
        await writeFile(targetPath, newFileContent);
        console.log(`wrote ${targetPath}.`);
      }
    },
  };
}
