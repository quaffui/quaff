import { execFile, spawnSync } from "child_process";
import { promisify } from "util";
import { createHash } from "crypto";
import { mkdtemp, readFile, readdir, rename, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { replaceGeneratedFiles, withGeneratedFilesLock } from "./generatedFiles.js";

const testDirectories: string[] = [];
const testLocks: string[] = [];
const generatedFilesModule = new URL("./generatedFiles.ts", import.meta.url).href;

async function fixtureDirectory() {
  const directory = await mkdtemp(path.join(tmpdir(), "quaff-generated-files-test-"));
  testDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all([
    ...testDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
    ...testLocks.splice(0).map((file) => rm(file, { recursive: true, force: true })),
  ]);
});

describe("generated props file transaction", () => {
  it("replaces generated files and removes orphans together", async () => {
    const directory = await fixtureDirectory();
    const first = path.join(directory, "first.ts");
    const second = path.join(directory, "second.ts");
    const orphan = path.join(directory, "orphan.ts");
    await Promise.all([
      writeFile(first, "old first"),
      writeFile(second, "old second"),
      writeFile(orphan, "old orphan"),
    ]);

    await replaceGeneratedFiles(
      [
        { destination: first, contents: "new first" },
        { destination: second, contents: "new second" },
      ],
      [orphan]
    );

    await expect(readFile(first, "utf8")).resolves.toBe("new first");
    await expect(readFile(second, "utf8")).resolves.toBe("new second");
    await expect(readFile(orphan, "utf8")).rejects.toMatchObject({ code: "ENOENT" });
    expect((await readdir(directory)).sort()).toEqual(["first.ts", "second.ts"]);
  });

  it("restores replacements and orphans if installation fails", async () => {
    const directory = await fixtureDirectory();
    const first = path.join(directory, "first.ts");
    const second = path.join(directory, "second.ts");
    const orphan = path.join(directory, "orphan.ts");
    await Promise.all([
      writeFile(first, "old first"),
      writeFile(second, "old second"),
      writeFile(orphan, "old orphan"),
    ]);

    await expect(
      replaceGeneratedFiles(
        [
          { destination: first, contents: "new first" },
          { destination: second, contents: "new second" },
        ],
        [orphan],
        {
          async rename(source, destination) {
            if (source.includes(".tmp") && destination === second) {
              throw new Error("injected installation failure");
            }

            await rename(source, destination);
          },
        }
      )
    ).rejects.toThrow("injected installation failure");

    await expect(readFile(first, "utf8")).resolves.toBe("old first");
    await expect(readFile(second, "utf8")).resolves.toBe("old second");
    await expect(readFile(orphan, "utf8")).resolves.toBe("old orphan");
    expect((await readdir(directory)).sort()).toEqual(["first.ts", "orphan.ts", "second.ts"]);
  });
});

describe("generated props file lock", () => {
  it("recovers a crashed owner without admitting concurrent writers", async () => {
    const directory = await fixtureDirectory();
    const scope = path.join(directory, "components");
    const key = createHash("sha256").update(path.resolve(scope)).digest("hex").slice(0, 20);
    testLocks.push(path.join(tmpdir(), `quaff-docgen-props-${key}.lockdir`));
    const crashed = spawnSync(
      "bun",
      [
        "-e",
        `
      import { withGeneratedFilesLock } from ${JSON.stringify(generatedFilesModule)};
      await withGeneratedFilesLock(${JSON.stringify(scope)}, async () => process.exit(0));
    `,
      ],
      { timeout: 2000, encoding: "utf8" }
    );
    expect(crashed.error).toBeUndefined();
    expect(crashed.status, crashed.stderr).toBe(0);
    let active = 0;
    let maximum = 0;

    await Promise.all(
      Array.from({ length: 12 }, () =>
        withGeneratedFilesLock(scope, async () => {
          active++;
          maximum = Math.max(maximum, active);
          await new Promise((resolve) => setTimeout(resolve, 10));
          active--;
        })
      )
    );

    expect(maximum).toBe(1);
  });

  it("serializes separate docgen processes", async () => {
    const directory = await fixtureDirectory();
    const marker = path.join(directory, "writer");
    const source = `
      import { withGeneratedFilesLock } from ${JSON.stringify(generatedFilesModule)};
      import { writeFile, rm } from "fs/promises";
      await withGeneratedFilesLock(${JSON.stringify(directory)}, async () => {
        await writeFile(${JSON.stringify(marker)}, "active", { flag: "wx" });
        await new Promise(resolve => setTimeout(resolve, 20));
        await rm(${JSON.stringify(marker)});
      });
    `;

    await Promise.all(
      Array.from({ length: 8 }, () => promisify(execFile)("bun", ["-e", source], { timeout: 3000 }))
    );
    await expect(readdir(directory)).resolves.toEqual([]);
  });

  it("fails promptly when the lock directory cannot be created", async () => {
    const directory = await fixtureDirectory();
    const result = spawnSync(
      "bun",
      [
        "-e",
        `
      import { withGeneratedFilesLock } from ${JSON.stringify(generatedFilesModule)};
      await withGeneratedFilesLock(${JSON.stringify(directory)}, async () => {});
    `,
      ],
      {
        env: { ...process.env, TMPDIR: path.join(directory, "missing") },
        timeout: 2000,
        encoding: "utf8",
      }
    );

    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("ENOENT");
  });
});
