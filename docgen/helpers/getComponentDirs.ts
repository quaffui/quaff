import { readdir } from "fs/promises";

export default async function getComponentDirs(componentsDir: string) {
  const dirents = await readdir(componentsDir, { withFileTypes: true });
  return dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
}
