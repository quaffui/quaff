import { mkdtemp, readFile, readdir, rename, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { replaceGeneratedFiles } from "./generatedFiles.js";

const testDirectories: string[] = [];

async function fixtureDirectory() {
  const directory = await mkdtemp(path.join(tmpdir(), "quaff-generated-files-test-"));
  testDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    testDirectories.splice(0).map((directory) => rm(directory, { recursive: true }))
  );
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
