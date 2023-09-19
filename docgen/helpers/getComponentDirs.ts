import { readdir } from "fs/promises";

export default async function getComponentDirs(componentsSir: string) {
  const dirents = await readdir(componentsSir, { withFileTypes: true });
  return dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
}
