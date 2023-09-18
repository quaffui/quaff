import writeVersion from "./writeVersion.js";
import type { Plugin } from "vite";

function versionPlugin(): Plugin {
  return {
    name: "version-plugin",
    async configResolved() {
      return await writeVersion();
    },
  };
}

export default versionPlugin;
