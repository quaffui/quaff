import { spawn } from "child_process";
import { basename, isAbsolute, relative, resolve as resolvePath, sep } from "path";
import updateAllSnippets from "../../docgen/snippets/updateAllSnippets.js";
import updateSnippetsForPage from "../../docgen/snippets/updateSnippetsForPage.js";
import getSnippetPagePaths from "../../docgen/snippets/getSnippetPagePaths.js";
import {
  getAffectedDocgenComponents,
  isDocgenSourceFile,
} from "../../docgen/props/dependencies.js";
import type { HotUpdateOptions, Logger, Plugin, ViteDevServer } from "vite";

const COMPONENTS_PATH = resolvePath("src/lib/components");
const SNIPPET_PAGE_FILE = "+page.svelte";
const DOCGEN_DEBOUNCE_MS = 75;
const GENERATED_DIRECTORIES = [
  "build",
  "dist",
  ".svelte-kit",
  "package",
  "plugins/dist",
  "docgen/target",
].map((directory) => resolvePath(directory));

function isGeneratedSource(file: string) {
  return GENERATED_DIRECTORIES.some((directory) => {
    const relativePath = relative(directory, file);

    return (
      relativePath !== ".." && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath)
    );
  });
}

async function debounceDocgen() {
  await new Promise((resolve) => setTimeout(resolve, DOCGEN_DEBOUNCE_MS));
}

function runDocGenProps(targets?: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("bun", ["scripts/docgenProps.ts", ...(targets ?? [])], {
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
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
  let hasPendingProps = false;
  let propsRun: Promise<void> | undefined;
  let isFullRunPending = false;
  const pendingPropsTargets = new Set<string>();

  function queueDocGenProps(files?: string[]) {
    if (!files) {
      isFullRunPending = true;
      pendingPropsTargets.clear();
    } else if (!isFullRunPending) {
      for (const file of files) {
        pendingPropsTargets.add(file);
      }
    }

    hasPendingProps = true;

    if (!propsRun) {
      propsRun = (async () => {
        try {
          while (hasPendingProps) {
            await debounceDocgen();
            hasPendingProps = false;

            const doGenerateAll = isFullRunPending;
            const targets = doGenerateAll ? undefined : [...pendingPropsTargets];

            isFullRunPending = false;
            pendingPropsTargets.clear();

            try {
              await runDocGenProps(targets);
            } catch (error) {
              if (!hasPendingProps) {
                throw error;
              }

              if (doGenerateAll) {
                isFullRunPending = true;
                pendingPropsTargets.clear();
              } else if (!isFullRunPending) {
                for (const target of targets ?? []) {
                  pendingPropsTargets.add(target);
                }
              }
            }
          }
        } finally {
          propsRun = undefined;
        }
      })();
    }

    return propsRun;
  }

  async function updateSnippet(file: string, server: ViteDevServer) {
    if (!snippetPagePaths.includes(file)) {
      return;
    }

    server.config.logger.info(DOCGEN_LOG_MESSAGE);
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

      await runDocgen(config.logger);
    },

    async hotUpdate({ file, server, type }: HotUpdateOptions) {
      if (this.environment.name !== "client") {
        return;
      }

      const fileName = basename(file);
      const isSnippetPage = fileName === SNIPPET_PAGE_FILE;
      const isPropsSource = !isSnippetPage && isDocgenSourceFile(file) && !isGeneratedSource(file);

      if (!isPropsSource && !isSnippetPage) {
        return;
      }

      try {
        if (isPropsSource) {
          const targets =
            type === "update"
              ? await getAffectedDocgenComponents(
                  file,
                  COMPONENTS_PATH,
                  async (source, importer) => {
                    const resolved = await server.pluginContainer.resolveId(source, importer);
                    return resolved?.external ? undefined : resolved?.id.split("?")[0];
                  }
                )
              : undefined;

          if (targets && !targets.length) {
            return;
          }

          server.config.logger.info(DOCGEN_LOG_MESSAGE);
          await queueDocGenProps(targets);
          server.config.logger.clearScreen("info");
        } else if (type === "update") {
          await updateSnippet(file, server);
        }
      } catch (error) {
        server.config.logger.error(String(error));
      }
    },
  };
}

export default docgenPlugin;
