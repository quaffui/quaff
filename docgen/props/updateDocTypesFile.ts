import { readFile, writeFile } from "fs/promises";

const docTypesPathUrl = new URL("../../src/lib/utils/types.json", import.meta.url);

export default async function updateDocTypesFile(
  newTypes: Record<string, string>,
  didUpdateAllFiles: boolean
) {
  let oldTypes: Record<string, string> = {};

  // if only a few files were updated, we need to build on the existing types data
  if (!didUpdateAllFiles) {
    const oldTypesStr = await readFile(docTypesPathUrl, "utf8");
    oldTypes = JSON.parse(oldTypesStr);
  }

  const allTypesRaw = Object.assign(oldTypes, newTypes);

  // sort alphabetically
  const allTypesSorted = Object.fromEntries(
    Object.entries(allTypesRaw).sort((a, b) => a[0].localeCompare(b[0]))
  );

  const allTypesStr = JSON.stringify(allTypesSorted, null, 2) + "\n";

  await writeFile(docTypesPathUrl, allTypesStr, "utf8");
}
