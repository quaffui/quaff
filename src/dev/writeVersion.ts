import { readFile, writeFile } from "fs/promises";

export default async function writeVersion() {
  const projectRootUrl = new URL("../../", import.meta.url);
  const packageJsonUrl = new URL("./package.json", projectRootUrl);
  const versionFileUrl = new URL("./src/lib/helpers/version.ts", projectRootUrl);

  const packageJsonData = await readFile(packageJsonUrl, "utf-8");
  const { version } = JSON.parse(packageJsonData);
  const content = `export default "${version}";\n`;

  return await writeFile(versionFileUrl, content);
}
