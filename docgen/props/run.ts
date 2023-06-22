import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import parseInterface, { ParsedProp } from "./parse-interface.js";
import parseDefaults, { ParsedDefault } from "./parse-defaults.js";
import prettier from "prettier";
import parseType from "../types/parseTypes.js";

async function formatCode(code: string) {
  const options = await prettier.resolveConfig(path.join(process.cwd(), ".prettierrc"));
  return prettier.format(code, { ...options, parser: "typescript" });
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../../src/lib/components");
const docTypes = path.resolve(dirname, "../../src/lib/utils/types.json");

async function run() {
  const componentDirs = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const dir of componentDirs) {
    const propsFilePath = path.resolve(rootDir, dir, "props.ts");

    if (fs.existsSync(propsFilePath)) {
      console.log("processing", propsFilePath);
      const parsedInterface = parseInterface(propsFilePath);
      parseType(propsFilePath, docTypes);

      let contents = "";

      Object.keys(parsedInterface).forEach((varName) => {
        function getResult(currentProp: ParsedProp, currentDefaults: ParsedDefault[]) {
          const defaultEntry = currentDefaults.find(
            (curDefault) => currentProp.name && curDefault.name === currentProp.name
          );

          return { ...currentProp, default: defaultEntry?.value };
        }

        const parsedDefaults = parseDefaults(propsFilePath, varName);

        const interfaceResults = parsedInterface[varName].map((prop) =>
          getResult(prop, parsedDefaults)
        );

        contents += `export const ${varName.replace(/Props$/, "DocsProps")} = ${JSON.stringify(
          interfaceResults,
          null,
          2
        )};\n\n`;
      });

      const formatted = await formatCode(contents);

      fs.writeFileSync(path.resolve(rootDir, dir, "docs.props.ts"), formatted, "utf-8");
    }
  }
}

run();
