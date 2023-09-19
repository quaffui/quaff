import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import getInfo from "../docgen/props/getInfo.js";
import WorkerManager from "../docgen/props/WorkerManager.js";
import getComponentDirs from "../docgen/helpers/getComponentDirs.js";
import type { WorkerTask } from "../docgen/props/WorkerManager.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../src/lib/components");
const docTypesPath = path.resolve(dirname, "../src/lib/utils/types.json");
let didUpdateAllFiles = true;

async function updateDocTypesFile(newTypes: Record<string, string>) {
  let oldTypes: Record<string, string> = {};

  // if only a few files were updated, we need to build on the existing types data
  if (!didUpdateAllFiles) {
    const oldTypesStr = await readFile(docTypesPath, "utf8");
    oldTypes = JSON.parse(oldTypesStr);
  }

  const allTypesRaw = Object.assign(oldTypes, newTypes);

  // sort alphabetically
  const allTypesSorted = Object.fromEntries(
    Object.entries(allTypesRaw).sort((a, b) => a[0].localeCompare(b[0]))
  );

  const allTypesStr = JSON.stringify(allTypesSorted, null, 2) + "\n";

  await writeFile(docTypesPath, allTypesStr, "utf8");
}

const workerPath = path.resolve(dirname, "../docgen/props/worker.ts");

async function run() {
  const componentDirs = await getComponentDirs(rootDir);
  const tasks: WorkerTask[] = [];

  for (const dir of componentDirs) {
    const propsFilePath = path.resolve(rootDir, dir, "props.ts");
    const docsPropsFilePath = path.resolve(rootDir, dir, "docs.props.ts");
    const { needsToBeGenerated, hashProps } = await getInfo(propsFilePath, docsPropsFilePath);

    if (needsToBeGenerated) {
      tasks.push({
        propsFilePath,
        docsPropsFilePath,
        hashProps,
      });
    }

    if (!needsToBeGenerated && hashProps) {
      didUpdateAllFiles = false;
    }
  }

  if (!tasks.length) {
    process.exit(0);
  }

  const workerManager = new WorkerManager(workerPath, tasks);

  workerManager.on("finished", async (types: Record<string, string>) => {
    await updateDocTypesFile(types);
  });
}

run();
