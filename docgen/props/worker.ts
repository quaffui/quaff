import { writeFile } from "fs/promises";
import { MessagePort, parentPort } from "worker_threads";
import parseTypes from "../types/parseTypes.js";
import formatCodeAndAddHash from "../helpers/formatCodeAndAddHash.js";
import parseInterface from "./parseInterface.js";

function assertHasParentPort(parentPort: MessagePort | null): asserts parentPort is MessagePort {
  if (!parentPort) {
    throw new Error("missing parentPort");
  }
}

assertHasParentPort(parentPort);

parentPort.on("message", async (workerData) => {
  const { propsFilePath, docsPropsFilePath, hashProps } = workerData;

  console.log("processing", propsFilePath);
  const parsedInterface = parseInterface(propsFilePath);
  const types = await parseTypes(propsFilePath);

  let contents = 'import { ParsedProp, ParsedSnippet } from "$docgen/props/parseInterface"\n\n';

  Object.keys(parsedInterface).forEach((varName) => {
    const interfaceResults = parsedInterface[varName];

    const props = interfaceResults.filter((prop) => !prop.isSnippet);
    const snippets = interfaceResults.filter((prop) => prop.isSnippet);

    contents += `export const ${varName.replace(/Props$/, "DocsProps")}: ParsedProp[] = ${JSON.stringify(
      props,
      null,
      2
    )};\n\n`;

    contents += `export const ${varName.replace(/Props$/, "DocsSnippets")}: ParsedSnippet[] = ${JSON.stringify(
      snippets,
      null,
      2
    )};\n\n`;
  });

  const formattedWithComment = await formatCodeAndAddHash(contents, hashProps);

  await writeFile(docsPropsFilePath, formattedWithComment, "utf8");

  assertHasParentPort(parentPort);

  parentPort.postMessage({ event: "finished", types });
});
