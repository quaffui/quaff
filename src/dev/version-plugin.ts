import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Plugin } from "vite";

function versionPlugin(): Plugin {
  return {
    name: "version-plugin",
    async configResolved(config) {
      const data = await readFile(path.resolve(process.cwd(), "package.json"), "utf-8");
      const { version } = JSON.parse(data);
      const content = `export default "${version}";\n`;

      return await writeFile(
        path.resolve(process.cwd(), config.root, "src/lib/helpers/version.ts"),
        content
      );
    },
  };
}

export default versionPlugin;
