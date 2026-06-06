import { readFile, writeFile } from "fs/promises";

const version = process.argv[2];

if (!version) {
  throw new Error("Usage: bun scripts/setPublishVersion.ts <version>");
}

const packageJsonUrl = new URL("../package.json", import.meta.url);
const versionUrl = new URL("../src/lib/helpers/version.ts", import.meta.url);
const packageJson = JSON.parse(await readFile(packageJsonUrl, "utf-8"));

packageJson.version = version;

await Promise.all([
  writeFile(packageJsonUrl, `${JSON.stringify(packageJson, null, 2)}\n`),
  writeFile(versionUrl, `export default ${JSON.stringify(version)};\n`),
]);
