import { execFile } from "node:child_process";
import { cp, mkdtemp, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { preview } from "vite";
import { createFixtureUrl, type FixtureServer } from "./fixtureServer";
import { removeDirectory } from "./temporaryDirectory";

const PROJECT_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const FIXTURES_ROOT = join(PROJECT_ROOT, "tests/fixtures");
const VITE_BIN = join(PROJECT_ROOT, "node_modules/vite/bin/vite.js");
const execFileAsync = promisify(execFile);

/**
 * Builds the SvelteKit app in `tests/fixtures/<name>` against Quaff's source in a
 * temporary directory. The shared config is only enabled as `vite.config.js` there.
 */
export async function buildAppFixture(name: string) {
  const directory = await mkdtemp(join(tmpdir(), `quaff-${name}-`));
  const remove = () => removeDirectory(directory);

  try {
    await copyAppFixture(name, directory);
    await execFileAsync(process.execPath, [VITE_BIN, "build"], {
      cwd: directory,
      env: { ...process.env, NODE_ENV: "production", QUAFF_TEST_ROOT: PROJECT_ROOT },
      timeout: 60_000,
      maxBuffer: 4 * 1024 * 1024,
    });
  } catch (error) {
    await remove();
    throw error;
  }

  return { directory, remove };
}

export async function startAppServer(name: string): Promise<FixtureServer> {
  const app = await buildAppFixture(name);
  const server = await preview({
    configFile: false,
    root: app.directory,
    build: { outDir: "build" },
    preview: { host: "127.0.0.1", port: 0 },
  });
  const baseUrl = server.resolvedUrls!.local[0];

  return {
    getUrl: (query, path = "/") => createFixtureUrl(baseUrl, path, query),
    async close() {
      await server.close();
      await app.remove();
    },
  };
}

async function copyAppFixture(name: string, directory: string) {
  await cp(join(FIXTURES_ROOT, name), directory, { recursive: true });
  await cp(join(FIXTURES_ROOT, "package.json"), join(directory, "package.json"));
  await cp(join(FIXTURES_ROOT, "viteConfig.js"), join(directory, "vite.config.js"));
  await symlink(join(PROJECT_ROOT, "node_modules"), join(directory, "node_modules"), "junction");
}
