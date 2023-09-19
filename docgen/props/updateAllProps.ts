import path from "path";
import { fileURLToPath } from "url";
import getInfo from "./getInfo.js";
import WorkerManager from "./WorkerManager.js";
import getComponentDirs from "../helpers/getComponentDirs.js";
import updateDocTypesFile from "./updateDocTypesFile.js";
import pathExists from "../helpers/pathExists.js";
import type { WorkerTask } from "./WorkerManager.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../../src/lib/components");
const docTypesPath = path.resolve(dirname, "../../src/lib/utils/types.json");

let didUpdateAllFiles = true;

const workerPath = path.resolve(dirname, "./worker.ts");

export default async function updateAllProps() {
  const componentDirs = await getComponentDirs(rootDir);
  const needsToRunAll = !(await pathExists(docTypesPath));
  const tasks: WorkerTask[] = [];

  for (const dir of componentDirs) {
    const propsFilePath = path.resolve(rootDir, dir, "props.ts");
    const docsPropsFilePath = path.resolve(rootDir, dir, "docs.props.ts");
    const { needsToBeGenerated, hashProps } = await getInfo(propsFilePath, docsPropsFilePath);

    if (needsToBeGenerated || (needsToRunAll && hashProps)) {
      tasks.push({
        propsFilePath,
        docsPropsFilePath,
        hashProps,
      });
    }

    if (!needsToBeGenerated && hashProps && !needsToRunAll) {
      didUpdateAllFiles = false;
    }
  }

  if (!tasks.length) {
    process.exit(0);
  }

  const workerManager = new WorkerManager(workerPath, tasks);

  workerManager.on("finished", async (types: Record<string, string>) => {
    await updateDocTypesFile(docTypesPath, types, didUpdateAllFiles);
  });
}
