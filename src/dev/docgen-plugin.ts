import { spawn } from "child_process";
import { basename } from "path";
import type { Plugin, ViteDevServer } from "vite";

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
      await runDocGenProps();
      config.logger.clearScreen("info");
    },

    handleHotUpdate({ file, server }: { file: string; server: ViteDevServer }) {
      const now = new Date().getTime();

      if (lastUpdated.file === file && now - lastUpdated.at < 500) {
        // throttle calls, in case of formatters etc.
        return;
      }

      lastUpdated.file = file;
      lastUpdated.at = now;

      const fileName = basename(file);

      if (fileName === "props.ts") {
        server.config.logger.info(DOCGEN_LOG_MESSAGE);
        runDocGenProps().then(() => server.config.logger.clearScreen("info"));
      }
    },
  };
}

export default docgenPlugin;
