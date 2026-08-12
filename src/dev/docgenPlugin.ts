import { spawn } from "child_process";
import { existsSync } from "fs";
import { basename, relative, resolve as resolvePath, sep } from "path";
import updateAllSnippets from "../../docgen/snippets/updateAllSnippets.js";
import updateSnippetsForPage from "../../docgen/snippets/updateSnippetsForPage.js";
import getSnippetPagePaths from "../../docgen/snippets/getSnippetPagePaths.js";
import waitForSvelteKit from "./waitForSvelteKit.js";
import type { Logger, Plugin, ViteDevServer } from "vite";

const SVELTE_KIT_PATH = "./.svelte-kit";
const LIB_PATH = resolvePath("src/lib");
const COMPONENTS_PATH = resolvePath("src/lib/components");
const GENERATED_PROPS_FILE = "docs.props.ts";
const SNIPPET_PAGE_FILE = "+page.svelte";
const DOCGEN_DEBOUNCE_MS = 75;

function isInside(root: string, file: string) {
  const relativePath = relative(root, file);

  return (
    relativePath !== ".." &&
    !relativePath.startsWith(`..${sep}`) &&
    !relativePath.includes(`${sep}..${sep}`)
  );
}

function isComponentSvelteFile(file: string) {
  return isInside(COMPONENTS_PATH, file) && file.endsWith(".svelte");
}

function isDocgenSourceFile(file: string) {
  return (
    (isInside(LIB_PATH, file) &&
      file.endsWith(".ts") &&
      !file.endsWith(".d.ts") &&
      basename(file) !== GENERATED_PROPS_FILE) ||
    isComponentSvelteFile(file)
  );
}

async function debounceDocgen() {
  await new Promise((resolve) => setTimeout(resolve, DOCGEN_DEBOUNCE_MS));
}

function runDocGenProps(targets?: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = "bun";
    const args = ["scripts/docgenProps.ts"];

    if (targets?.length) {
      args.push(...targets);
    }

    const options = {
      env: {
        ...process.env,
      },
      stdio: "inherit" as const,
    };

    const child = spawn(cmd, args, options);
    let settled = false;

    child.once("error", (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });

    child.once("exit", (code, signal) => {
      if (settled) {
        return;
      }

      settled = true;

      if (code === 0) {
        resolve();
      } else {
        const status = signal ? `signal ${signal}` : `exit code ${code ?? "unknown"}`;
        reject(new Error(`Props docgen process failed with ${status}.`));
      }
    });
  });
}

const DOCGEN_LOG_MESSAGE = "→ docgen";

function docgenPlugin(): Plugin {
  let snippetPagePaths: string[] = [];
  let propsDirty = false;
  let propsRun: Promise<void> | undefined;
  let pendingAllProps = false;
  const pendingPropsTargets = new Set<string>();

  function queueDocGenProps(file?: string) {
    if (!file || !isInside(COMPONENTS_PATH, file)) {
      pendingAllProps = true;
      pendingPropsTargets.clear();
    } else if (!pendingAllProps) {
      pendingPropsTargets.add(file);
    }

    propsDirty = true;

    if (!propsRun) {
      propsRun = (async () => {
        while (propsDirty) {
          await debounceDocgen();
          propsDirty = false;

          const runAll = pendingAllProps;
          const targets = runAll ? undefined : [...pendingPropsTargets];

          pendingAllProps = false;
          pendingPropsTargets.clear();

          await runDocGenProps(targets);
        }
      })().finally(() => {
        propsRun = undefined;
      });
    }

    return propsRun;
  }

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
    await Promise.all([queueDocGenProps(), updateAllSnippets()]);
    logger.clearScreen("info");
  }

  return {
    name: "docgen-plugin",
    async configResolved(config) {
      if (config.command !== "serve" || config.mode === "test") {
        return;
      }

      const svelteKitPathResolved = resolvePath(SVELTE_KIT_PATH);
      const svelteKitTsconfigPathResolved = resolvePath(SVELTE_KIT_PATH, "tsconfig.json");

      if (existsSync(svelteKitTsconfigPathResolved)) {
        await runDocgen(config.logger);
        return;
      }

      // don't block
      void waitForSvelteKit({ svelteKitPathResolved, svelteKitTsconfigPathResolved })
        .then(() => runDocgen(config.logger))
        .catch((error) => config.logger.error(String(error)));
    },

    handleHotUpdate({ file, server }: { file: string; server: ViteDevServer }) {
      const fileName = basename(file);
      const isPropsSource = isDocgenSourceFile(file);
      const isSnippetPage = fileName === SNIPPET_PAGE_FILE;

      if (!isPropsSource && !isSnippetPage) {
        return;
      }

      server.config.logger.info(DOCGEN_LOG_MESSAGE);

      if (isPropsSource) {
        queueDocGenProps(file)
          .then(() => server.config.logger.clearScreen("info"))
          .catch((error) => server.config.logger.error(String(error)));
      } else {
        updateSnippet(file, server).catch((error) => server.config.logger.error(String(error)));
      }
    },
  };
}

export default docgenPlugin;
