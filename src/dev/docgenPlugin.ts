import { spawn } from "child_process";
import { existsSync } from "fs";
import { basename, resolve as resolvePath } from "path";
import updateAllSnippets from "../../docgen/snippets/updateAllSnippets.js";
import updateSnippetsForPage from "../../docgen/snippets/updateSnippetsForPage.js";
import getSnippetPagePaths from "../../docgen/snippets/getSnippetPagePaths.js";
import waitForSvelteKit from "./waitForSvelteKit.js";
import type { Logger, Plugin, ViteDevServer } from "vite";

const SVELTE_KIT_PATH = "./.svelte-kit";

enum HotUpdateFileName {
  Props = "props.ts",
  Page = "+page.svelte",
}

function runDocGenProps(): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = "bun";
    const args = ["scripts/docgenProps.ts"];
    const options = {
      env: {
        ...process.env,
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

  let snippetPagePaths: string[] = [];

  async function updateSnippet(file: string, server: ViteDevServer) {
    if (!snippetPagePaths.includes(file)) {
      return;
    }

    await updateSnippetsForPage(file);
    server.config.logger.clearScreen("info");
  }

  async function runDocgen(logger: Logger) {
    logger.info(DOCGEN_LOG_MESSAGE);
    snippetPagePaths = await getSnippetPagePaths();
    await Promise.all([runDocGenProps(), updateAllSnippets()]);
    logger.clearScreen("info");
  }

  return {
    name: "docgen-plugin",
    async configResolved(config) {
      const svelteKitPathResolved = resolvePath(SVELTE_KIT_PATH);
      const svelteKitTsconfigPathResolved = resolvePath(SVELTE_KIT_PATH, "tsconfig.json");

      if (existsSync(svelteKitTsconfigPathResolved)) {
        await runDocgen(config.logger);
        return;
      }

      // don't block
      waitForSvelteKit({ svelteKitPathResolved, svelteKitTsconfigPathResolved }).then(() =>
        runDocgen(config.logger)
      );
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
        updateSnippet(file, server);
      }
    },
  };
}

export default docgenPlugin;
