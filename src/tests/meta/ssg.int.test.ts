import { execFile } from "child_process";
import { cp, mkdtemp, readFile, rename, rm, symlink } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));
const fixture = fileURLToPath(new URL("../../../tests/fixtures/meta-ssg/", import.meta.url));
const exec = promisify(execFile);

it("prerenders loaded page metadata into the static HTML head", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "quaff-meta-ssg-"));

  try {
    await cp(fixture, directory, { recursive: true });
    // Enable the fixture configs only in the temporary project.
    await rename(path.join(directory, "svelteConfig.js"), path.join(directory, "svelte.config.js"));
    await rename(path.join(directory, "viteConfig.js"), path.join(directory, "vite.config.js"));
    await symlink(
      path.join(projectRoot, "node_modules"),
      path.join(directory, "node_modules"),
      "junction"
    );
    await exec(
      process.execPath,
      [path.join(projectRoot, "node_modules/vite/bin/vite.js"), "build"],
      {
        cwd: directory,
        env: {
          ...process.env,
          NODE_ENV: "production",
          QUAFF_META_TEST_LIB: path.join(projectRoot, "src/lib"),
        },
        timeout: 30_000,
      }
    );

    const html = await readFile(path.join(directory, "build/index.html"), "utf8");
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";

    expect(head.match(/<title>[^<]*<\/title>/g)).toEqual(["<title>Loaded page | Quaff</title>"]);
    const descriptions = head.match(/<meta\b[^>]*name="description"[^>]*>/g);
    expect(descriptions).toHaveLength(1);
    expect(descriptions?.[0]).toContain('content="Loaded before rendering."');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}, 40_000);
