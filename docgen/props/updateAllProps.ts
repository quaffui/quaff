import path from "path";
import { fileURLToPath } from "url";
import getComponentDirs from "../helpers/getComponentDirs.js";
import WorkerManager from "./WorkerManager.js";
import getInfo from "./getInfo.js";
import type { WorkerTask } from "./WorkerManager.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../../src/lib/components");

export default async function updateAllProps() {
  const componentDirs = await getComponentDirs(rootDir);
  const tasks: WorkerTask[] = [];

  const workerPath = path.resolve(dirname, "./worker.ts");

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
  }

  if (!tasks.length) {
    process.exit(0);
  }

  new WorkerManager(workerPath, tasks);
}
