import { basename, isAbsolute, relative, resolve as resolvePath, sep } from "path";
import updateAllSnippets from "../../docgen/snippets/updateAllSnippets.js";
import updateSnippetsForPage from "../../docgen/snippets/updateSnippetsForPage.js";
import getSnippetPagePaths from "../../docgen/snippets/getSnippetPagePaths.js";
import runPropsDocgen, { type DocgenOptions } from "../../docgen/run.js";
import type { HotUpdateOptions, Logger, Plugin, ViteDevServer } from "vite";

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

const DOCGEN_LOG_MESSAGE = "→ docgen";

function docgenPlugin(): Plugin {
  let snippetPagePaths: string[] = [];
  let propsRun: Promise<void> | undefined;
  let isFullRunPending = false;
  const pendingChangedFiles = new Set<string>();

  let resolveImport: DocgenOptions["resolveImport"];

  const hasPendingProps = () => isFullRunPending || pendingChangedFiles.size > 0;

  function mergePendingChanges(files?: string[]) {
    if (!files) {
      isFullRunPending = true;
      pendingChangedFiles.clear();
    } else if (!isFullRunPending) {
      for (const file of files) {
        pendingChangedFiles.add(file);
      }
    }
  }

  function queueDocGenProps(files?: string[]) {
    mergePendingChanges(files);

    if (!propsRun) {
      propsRun = (async () => {
        try {
          while (hasPendingProps()) {
            await debounceDocgen();

            const changedFiles = isFullRunPending ? undefined : [...pendingChangedFiles];

            isFullRunPending = false;
            pendingChangedFiles.clear();

            try {
              await runPropsDocgen({ changedFiles, resolveImport });
            } catch (error) {
              if (!hasPendingProps()) {
                throw error;
              }

              mergePendingChanges(changedFiles);
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
      const isPropsSource =
        !isSnippetPage &&
        /\.(?:[cm]?[jt]s|svelte)$/.test(file) &&
        !/^docs(?:\.(?:props|snippets))?\.ts$/.test(fileName) &&
        !isGeneratedSource(file);

      if (!isPropsSource && !isSnippetPage) {
        return;
      }

      try {
        if (isPropsSource) {
          resolveImport = async (source, importer) => {
            const resolved = await server.pluginContainer.resolveId(source, importer);
            return resolved?.external ? undefined : resolved?.id.split("?")[0];
          };

          server.config.logger.info(DOCGEN_LOG_MESSAGE);
          await queueDocGenProps(type === "update" ? [file] : undefined);
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
