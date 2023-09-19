import path from "path";
import { fileURLToPath } from "url";
import getComponentDirs from "../helpers/getComponentDirs.js";
import updateSnippetsForPage from "./updateSnippetsForPage.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../../src/routes/components");

export default async function updateAllSnippets() {
  const componentsToIgnore = ["layout"];

  const componentDirs = (await getComponentDirs(rootDir)).filter(
    (dir) => !componentsToIgnore.includes(dir)
  );

  for (const dir of componentDirs) {
    const dirPath = path.resolve(rootDir, dir);
    const pageFilePath = path.resolve(dirPath, "+page.svelte");
    await updateSnippetsForPage(pageFilePath);
  }
}
