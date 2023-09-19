import { spawn } from "child_process";
import { basename } from "path";
import updateAllSnippets from "../../docgen/snippets/updateAllSnippets.js";
import updateSnippetsForPage from "../../docgen/snippets/updateSnippetsForPage";
import type { Plugin, ViteDevServer } from "vite";

enum HotUpdateFileName {
  Props = "props.ts",
  Page = "+page.svelte",
}

function runDocGenProps(): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = "node";
    const args = ["scripts/docgenProps.ts"];
    const options = {
      env: {
        ...process.env,
        NODE_OPTIONS: "--loader ts-node/esm/transpile-only --no-warnings",
      },
      stdio: "inherit" as const,
    };

    const child = spawn(cmd, args, options);

    child.on("error", reject);

    child.on("exit", (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code: ${code}`));
      }
    });
  });
}

const DOCGEN_LOG_MESSAGE = "→ docgen";

function docgenPlugin(): Plugin {
  const lastUpdated = {
    file: "",
    at: 0,
  };

  return {
    name: "docgen-plugin",
    async configResolved(config) {
      config.logger.info(DOCGEN_LOG_MESSAGE);
      const p1 = runDocGenProps();
      const p2 = updateAllSnippets();
      await Promise.all([p1, p2]);
      config.logger.clearScreen("info");
    },

    handleHotUpdate({ file, server }: { file: string; server: ViteDevServer }) {
      const now = new Date().getTime();
      const fileName = basename(file);

      if (!Object.values(HotUpdateFileName).includes(fileName as HotUpdateFileName)) {
        return;
      }

      if (lastUpdated.file === file && now - lastUpdated.at < 500) {
        // throttle calls, in case of formatters etc.
        return;
      }

      lastUpdated.file = file;
      lastUpdated.at = now;

      const isProps = fileName === HotUpdateFileName.Props;
      server.config.logger.info(DOCGEN_LOG_MESSAGE);

      if (isProps) {
        runDocGenProps().then(() => server.config.logger.clearScreen("info"));
      } else {
        updateSnippetsForPage(file).then(() => server.config.logger.clearScreen("info"));
      }
    },
  };
}

export default docgenPlugin;
