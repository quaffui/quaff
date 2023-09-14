import { writeFile, readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import parseInterface from "./parse-interface.js";
import prettier from "prettier";
import parseType from "../types/parseTypes.js";
import getInfo from "./getInfo.js";

async function formatCode(code: string) {
  const options = await prettier.resolveConfig(path.join(process.cwd(), ".prettierrc"));
  return prettier.format(code, { ...options, parser: "typescript" });
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "../../src/lib/components");
const docTypes = path.resolve(dirname, "../../src/lib/utils/types.json");

async function getComponentDirs(rootDir: string) {
  const dirents = await readdir(rootDir, { withFileTypes: true });
  return dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name);
}

async function run() {
  const componentDirs = await getComponentDirs(rootDir);

  for (const dir of componentDirs) {
    const propsFilePath = path.resolve(rootDir, dir, "props.ts");
    const docsPropsFilePath = path.resolve(rootDir, dir, "docs.props.ts");
    const { needsToBeGenerated, hashProps } = await getInfo(propsFilePath, docsPropsFilePath);

    if (needsToBeGenerated) {
      console.log("processing", propsFilePath);
      const parsedInterface = parseInterface(propsFilePath);
      parseType(propsFilePath, docTypes);

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
    }
  }
}

run();
