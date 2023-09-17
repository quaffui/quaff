import { writeFile } from "fs/promises";
import { MessagePort, parentPort } from "worker_threads";
import path from "path";
import prettier from "prettier";
import parseInterface from "./parseInterface.js";
import parseTypes from "../types/parseTypes.js";

function assertHasParentPort(parentPort: MessagePort | null): asserts parentPort is MessagePort {
  if (!parentPort) {
    throw new Error("missing parentPort");
  }
}

async function formatCode(code: string) {
  const options = await prettier.resolveConfig(path.join(process.cwd(), ".prettierrc"));
  return prettier.format(code, { ...options, parser: "typescript" });
}

assertHasParentPort(parentPort);

parentPort.on("message", async (workerData) => {
  const { propsFilePath, docsPropsFilePath, hashProps } = workerData;

  console.log("processing", propsFilePath);
  const parsedInterface = parseInterface(propsFilePath);
  const types = await parseTypes(propsFilePath);

  let contents = "";

  Object.keys(parsedInterface).forEach((varName) => {
    const interfaceResults = parsedInterface[varName];

    contents += `export const ${varName.replace(/Props$/, "DocsProps")} = ${JSON.stringify(
      interfaceResults,
      null,
      2
    )};\n\n`;
  });

  const formatted = await formatCode(contents);
  const formattedWithComment = [
    "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE",
    `// @quaffHash ${hashProps}`,
    "",
    formatted,
  ].join("\n");

  await writeFile(docsPropsFilePath, formattedWithComment, "utf8");

  assertHasParentPort(parentPort);

  parentPort.postMessage({ event: "finished", types });
});
