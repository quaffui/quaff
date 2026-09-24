import { readFile, rm, stat, utimes, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import pathExists from "../helpers/pathExists.js";
import updateAllProps, { resolveTargetDirs } from "./updateAllProps.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const componentsDir = path.resolve(dirname, "../../src/lib/components");
const sampleComponentDirs = ["button", "card", "tabs"];

describe("resolveTargetDirs", () => {
  it("returns undefined when no targets are supplied", () => {
    expect(resolveTargetDirs(sampleComponentDirs)).toBeUndefined();
    expect(resolveTargetDirs(sampleComponentDirs, [])).toBeUndefined();
    expect(resolveTargetDirs(sampleComponentDirs, ["   "])).toBeUndefined();
  });

  it("resolves direct component directory names", () => {
    expect(resolveTargetDirs(sampleComponentDirs, ["button"])).toEqual(new Set(["button"]));
    expect(resolveTargetDirs(sampleComponentDirs, ["button", "tabs"])).toEqual(
      new Set(["button", "tabs"])
    );
  });

  it("resolves relative and absolute file paths within components", () => {
    const relativeProps = "src/lib/components/button/props.ts";
    const absoluteSvelte = path.resolve(componentsDir, "card/QCard.svelte");

    expect(resolveTargetDirs(sampleComponentDirs, [relativeProps])).toEqual(new Set(["button"]));
    expect(resolveTargetDirs(sampleComponentDirs, [absoluteSvelte])).toEqual(new Set(["card"]));
    expect(resolveTargetDirs(sampleComponentDirs, [relativeProps, absoluteSvelte])).toEqual(
      new Set(["button", "card"])
    );
  });

  it("returns undefined when the root components directory is passed", () => {
    expect(resolveTargetDirs(sampleComponentDirs, [componentsDir])).toBeUndefined();
    expect(resolveTargetDirs(sampleComponentDirs, ["src/lib/components"])).toBeUndefined();
  });

  it("rejects targets outside the components directory", () => {
    expect(() => resolveTargetDirs(sampleComponentDirs, ["src/lib/types/index.ts"])).toThrow(
      "Target is not within the components directory"
    );
  });

  it("rejects unknown component targets", () => {
    expect(() =>
      resolveTargetDirs(sampleComponentDirs, ["src/lib/components/unknown/props.ts"])
    ).toThrow("Component directory not found for target");
  });
});

describe("targeted updateAllProps", () => {
  it("generates a target without replacing unchanged documentation", async () => {
    await updateAllProps(["button"]);

    const generatedFile = path.resolve(componentsDir, "button/docs.ts");
    const legacyFile = path.resolve(componentsDir, "button/docs.props.ts");
    const previousTime = new Date("2020-01-01T00:00:00Z");
    const originalDocs = await readFile(generatedFile, "utf8");
    expect(originalDocs).toContain("Buttons help users take action");
    expect(originalDocs).not.toContain("events:");
    expect(originalDocs).not.toContain("./docs.props");
    expect(await pathExists(legacyFile)).toBe(false);

    await utimes(generatedFile, previousTime, previousTime);
    await updateAllProps(["button"]);
    expect((await stat(generatedFile)).mtimeMs).toBe(previousTime.getTime());

    await writeFile(legacyFile, "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE\nold output");
    await updateAllProps(["button"]);
    expect(await pathExists(legacyFile)).toBe(false);
    expect((await stat(generatedFile)).mtimeMs).toBe(previousTime.getTime());

    await rm(generatedFile);
    await updateAllProps(["button"]);
    expect(await readFile(generatedFile, "utf8")).toBe(originalDocs);
  }, 60_000);
});
