import { access } from "fs/promises";

export default async function pathExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}
