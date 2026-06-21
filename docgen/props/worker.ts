import { writeFile } from "fs/promises";
import { MessagePort, parentPort } from "worker_threads";
import parseTypes from "../types/parseTypes.js";
import formatCodeAndAddHash from "../helpers/formatCodeAndAddHash.js";

import { parseInterfaces } from "./parsePropsInterface";
import { ParsedPropertyFlags, type ParsedProperty } from "./parsePropsInterface/defs";

function assertHasParentPort(parentPort: MessagePort | null): asserts parentPort is MessagePort {
  if (!parentPort) {
    throw new Error("missing parentPort");
  }
}

assertHasParentPort(parentPort);

parentPort.on("message", async (workerData) => {
  const { propsFilePath, docsPropsFilePath, hashProps } = workerData;

  console.log("processing", propsFilePath);
  try {
    const parsedInterface = await parseInterfaces(propsFilePath);
    const types = await parseTypes(propsFilePath);

    let contents =
      'import { MaybeParsed, ParsedGeneric, ParsedProperty } from "$docgen/props/parsePropsInterface/defs"\n\n';

    Object.keys(parsedInterface).forEach((interfaceName) => {
      const parsedData = parsedInterface[interfaceName];

      const props: ParsedProperty[] = [];
      const snippets: ParsedProperty[] = [];

      for (const prop of parsedData.properties) {
        if (prop.flags & ParsedPropertyFlags.SNIPPET) {
          snippets.push(prop);
        } else {
          props.push(prop);
        }
      }

      const name = interfaceName.replace(/Props$/, "Docs");

      contents += `export const ${name}DomAttributesConstraint: MaybeParsed | undefined = ${JSON.stringify(
        parsedData.domAttributesConstraint,
        null,
        2
      )};\n\n`;

      contents += `export const ${name}Generics: ParsedGeneric[] = ${JSON.stringify(
        parsedData.generics,
        null,
        2
      )};\n\n`;

      contents += `export const ${name}Props: ParsedProperty[] = ${JSON.stringify(
        props,
        null,
        2
      )};\n\n`;

      contents += `export const ${name}Snippets: ParsedProperty[] = ${JSON.stringify(
        snippets,
        null,
        2
      )};\n\n`;
    });

    const formattedWithComment = await formatCodeAndAddHash(contents, hashProps);

    await writeFile(docsPropsFilePath, formattedWithComment, "utf8");

    assertHasParentPort(parentPort);

    parentPort.postMessage({ event: "finished", types });
  } catch (err) {
    console.error("error processing", propsFilePath, err);
    throw err;
  }
});
