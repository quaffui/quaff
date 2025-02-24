import path from "path";
import { fileURLToPath } from "url";
import getComponentDirs from "../helpers/getComponentDirs.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../../src/routes/components");

export default async function getSnippetPagePaths() {
  const componentsToIgnore = ["layout", "private"];

  const componentDirs = (await getComponentDirs(rootDir)).filter(
    (dir) => !componentsToIgnore.includes(dir)
  );

  return componentDirs.map((dir) => {
    const dirPath = path.resolve(rootDir, dir);
    return path.resolve(dirPath, "+page.svelte");
  });
}
