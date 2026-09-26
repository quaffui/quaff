import { execFileSync } from "child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  stat,
  symlink,
  utimes,
  writeFile,
} from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import runDocgen from "./run.js";

const GENERATED_HEADER = "// AUTO GENERATED FILE - DO NOT MODIFY OR DELETE";
const PREVIOUS_TIME = new Date("2000-01-01T00:00:00Z");
const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

async function writeSources(root: string, files: Record<string, string>) {
  await Promise.all(
    Object.entries(files).map(async ([name, contents]) => {
      const destination = path.join(root, name);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, contents);
    })
  );
}

async function createProject(files: Record<string, string> = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "quaff-docgen-pipeline-"));
  directories.push(root);
  await writeSources(root, {
    ".prettierrc": "{}",
    "bun.lock": "{}",
    "package.json": "{}",
    "src/lib/components/first/props.ts": "export interface FirstProps { value?: string; }",
    "src/lib/components/first/First.svelte":
      '<script lang="ts">let { value = "first" } = $props();</script>',
    "src/lib/components/second/props.ts": "export interface SecondProps { disabled?: boolean; }",
    "src/lib/components/second/Second.svelte":
      '<script lang="ts">let { disabled = false } = $props();</script>',
    ...files,
  });
  return root;
}

function outputPath(root: string, component: string, filename = "docs.ts") {
  return path.join(root, "src/lib/components", component, filename);
}

async function markUnchanged(...files: string[]) {
  await Promise.all(files.map((file) => utimes(file, PREVIOUS_TIME, PREVIOUS_TIME)));
}

describe("Rust-owned docgen pipeline", () => {
  it("resolves component names and relative or absolute source targets", async () => {
    const root = await createProject();
    const script = `import runDocgen from ${JSON.stringify(path.resolve("docgen/run.ts"))}; await runDocgen(${JSON.stringify({ projectRoot: root, targets: ["props.ts", "props.ts"] })});`;
    execFileSync("bun", ["-e", script], { cwd: path.dirname(outputPath(root, "first")) });
    expect(await readFile(outputPath(root, "first"), "utf8")).toContain("export const FirstDocs");
    await expect(stat(outputPath(root, "second"))).rejects.toMatchObject({ code: "ENOENT" });
    await rm(outputPath(root, "first"));

    await runDocgen({
      projectRoot: root,
      targets: [
        path.relative(process.cwd(), outputPath(root, "first", "props.ts")),
        outputPath(root, "second", "Second.svelte"),
      ],
    });
    expect(await readFile(outputPath(root, "first"), "utf8")).toContain("export const FirstDocs");
    expect(await readFile(outputPath(root, "second"), "utf8")).toContain("export const SecondDocs");
    await expect(
      runDocgen({ projectRoot: root, targets: ["src/lib/types/index.ts"] })
    ).rejects.toThrow(/components directory/i);
    await expect(
      runDocgen({
        projectRoot: root,
        targets: [path.join(root, "src/lib/components/unknown/props.ts")],
      })
    ).rejects.toThrow(/not found|unknown/i);
  }, 60_000);

  it.each([["src/lib/components"], ["   "]])(
    "treats %j as a full generation request",
    async (...targets) => {
      const root = await createProject();
      const relativeTargets = targets.map((target) =>
        target.trim() ? path.relative(process.cwd(), path.join(root, target)) : target
      );
      await runDocgen({ projectRoot: root, targets: relativeTargets });
      expect(await readFile(outputPath(root, "first"), "utf8")).toContain("FirstDocs");
      expect(await readFile(outputPath(root, "second"), "utf8")).toContain("SecondDocs");
    },
    60_000
  );

  it("resolves symlinked project paths, including missing source files", async () => {
    const root = await createProject();
    const alias = path.join(root, "project-link");
    await symlink(root, alias, process.platform === "win32" ? "junction" : "dir");

    for (const target of [
      path.relative(process.cwd(), outputPath(alias, "first", "props.ts")),
      outputPath(alias, "first", "First.svelte"),
      outputPath(alias, "first", "missing/nested.ts"),
    ]) {
      await runDocgen({ projectRoot: alias, targets: [target] });
      expect(await readFile(outputPath(root, "first"), "utf8")).toContain("FirstDocs");
      await expect(stat(outputPath(root, "second"))).rejects.toMatchObject({ code: "ENOENT" });
      await rm(outputPath(root, "first"));
    }

    await runDocgen({ projectRoot: root, targets: [path.join(alias, "src/lib/components")] });
    expect(await readFile(outputPath(root, "first"), "utf8")).toContain("FirstDocs");
    expect(await readFile(outputPath(root, "second"), "utf8")).toContain("SecondDocs");

    const components = path.join(root, "src/lib/components");
    const componentSources = path.join(root, "src/lib/component-sources");
    await rename(components, componentSources);
    await symlink(componentSources, components, process.platform === "win32" ? "junction" : "dir");
    await rm(outputPath(root, "first"));
    await runDocgen({ projectRoot: root, targets: [outputPath(alias, "first", "props.ts")] });
    expect(await readFile(outputPath(root, "first"), "utf8")).toContain("FirstDocs");
  }, 60_000);

  it("keeps cached outputs untouched and regenerates a missing output", async () => {
    const root = await createProject();
    const first = outputPath(root, "first");
    const second = outputPath(root, "second");
    await runDocgen({ projectRoot: root });
    const original = await readFile(first, "utf8");
    await markUnchanged(first, second);
    await runDocgen({ projectRoot: root });
    expect((await stat(first)).mtimeMs).toBe(PREVIOUS_TIME.getTime());
    expect((await stat(second)).mtimeMs).toBe(PREVIOUS_TIME.getTime());

    await rm(first);
    await runDocgen({ projectRoot: root });
    expect(await readFile(first, "utf8")).toBe(original);
    expect((await stat(second)).mtimeMs).toBe(PREVIOUS_TIME.getTime());
  }, 60_000);

  it("removes only owned orphan outputs within the selected scope", async () => {
    const root = await createProject({
      "src/lib/components/first/docs.props.ts": `${GENERATED_HEADER}\nlegacy first`,
      "src/lib/components/second/docs.props.ts": "// Handwritten legacy file",
      "src/lib/components/orphan/docs.ts": `${GENERATED_HEADER}\norphan`,
      "src/lib/components/orphan/docs.props.ts": `${GENERATED_HEADER}\nlegacy orphan`,
      "src/lib/components/manual/docs.ts": "// Handwritten documentation",
      "src/lib/components/manual/docs.props.ts": "// Handwritten metadata",
    });
    await runDocgen({ projectRoot: root, targets: ["first"] });
    await expect(stat(outputPath(root, "first", "docs.props.ts"))).rejects.toMatchObject({
      code: "ENOENT",
    });
    expect(await readFile(outputPath(root, "orphan"), "utf8")).toContain("orphan");
    await markUnchanged(outputPath(root, "first"));
    await runDocgen({ projectRoot: root });

    for (const filename of ["docs.ts", "docs.props.ts"]) {
      await expect(stat(outputPath(root, "orphan", filename))).rejects.toMatchObject({
        code: "ENOENT",
      });
    }

    expect(await readFile(outputPath(root, "second", "docs.props.ts"), "utf8")).toBe(
      "// Handwritten legacy file"
    );
    expect(await readFile(outputPath(root, "manual"), "utf8")).toBe("// Handwritten documentation");
    expect(await readFile(outputPath(root, "manual", "docs.props.ts"), "utf8")).toBe(
      "// Handwritten metadata"
    );
    expect((await stat(outputPath(root, "first"))).mtimeMs).toBe(PREVIOUS_TIME.getTime());
  }, 60_000);

  it("invalidates transitive shared types and inherited defaults without touching unrelated outputs", async () => {
    const root = await createProject({
      "src/lib/types/index.ts": 'export type { Shared } from "./shared.js";',
      "src/lib/types/shared.ts":
        'import type { Outside } from "../../outside"; export type Shared = Outside;',
      "src/outside.ts": 'export type Outside = "before";',
      "src/lib/internal/base/props.ts": "export interface BaseProps { disabled?: boolean; }",
      "src/lib/internal/base/Base.svelte":
        '<script lang="ts">let { disabled = false } = $props();</script>',
      "src/lib/components/first/props.ts":
        'import type { Shared } from "$types"; import type { BaseProps } from "$internal/base/props"; export interface FirstProps extends BaseProps { value?: Shared; }',
      "src/lib/components/second/props.ts":
        'import type { FirstProps } from "../first/props"; export interface SecondProps extends FirstProps {}',
      "src/lib/components/second/Second.svelte": "<p>Inherits defaults</p>",
      "src/lib/components/independent/props.ts": "export interface IndependentProps {}",
      "src/lib/components/independent/Independent.svelte": "<p>Independent</p>",
    });
    const outputs = ["first", "second", "independent"].map((name) => outputPath(root, name));
    await runDocgen({ projectRoot: root });
    const original = await Promise.all(outputs.map((file) => readFile(file, "utf8")));
    await markUnchanged(...outputs);
    await writeSources(root, { "src/outside.ts": 'export type Outside = "after";' });
    await runDocgen({ projectRoot: root, changedFiles: [path.join(root, "src/outside.ts")] });
    const sharedChange = await Promise.all(outputs.map((file) => readFile(file, "utf8")));
    expect(sharedChange[0]).not.toBe(original[0]);
    expect(sharedChange[1]).not.toBe(original[1]);
    expect(sharedChange[2]).toBe(original[2]);
    expect((await stat(outputs[2])).mtimeMs).toBe(PREVIOUS_TIME.getTime());

    await markUnchanged(...outputs);
    const inheritedSource = "src/lib/internal/base/Base.svelte";
    await writeSources(root, {
      [inheritedSource]: '<script lang="ts">let { disabled = true } = $props();</script>',
    });
    await runDocgen({ projectRoot: root, changedFiles: [path.join(root, inheritedSource)] });
    expect(await readFile(outputs[0], "utf8")).not.toBe(sharedChange[0]);
    expect(await readFile(outputs[1], "utf8")).not.toBe(sharedChange[1]);

    for (const file of outputs.slice(0, 2)) {
      expect(await readFile(file, "utf8")).toMatch(/<b>disabled<\/b>.*\btrue\b/);
    }

    expect((await stat(outputs[2])).mtimeMs).toBe(PREVIOUS_TIME.getTime());

    await markUnchanged(...outputs);
    await writeSources(root, { "src/unrelated.ts": "export type Unrelated = number;" });
    await runDocgen({ projectRoot: root, changedFiles: [path.join(root, "src/unrelated.ts")] });
    expect(await Promise.all(outputs.map(async (file) => (await stat(file)).mtimeMs))).toEqual(
      outputs.map(() => PREVIOUS_TIME.getTime())
    );
  }, 60_000);

  it("includes project configuration in the cache key", async () => {
    const root = await createProject();
    const first = outputPath(root, "first");
    await runDocgen({ projectRoot: root });
    const original = await readFile(first, "utf8");
    await markUnchanged(first);
    await writeSources(root, { ".prettierrc": '{"singleQuote": true}' });
    await runDocgen({ projectRoot: root });
    const updated = await readFile(first, "utf8");
    expect(updated).not.toBe(original);
    expect(updated).toContain("from '$docs'");
    expect((await stat(first)).mtimeMs).not.toBe(PREVIOUS_TIME.getTime());
  }, 60_000);

  it("preserves every output and orphan if a selected source is invalid", async () => {
    const root = await createProject();
    const outputs = [outputPath(root, "first"), outputPath(root, "second")];
    await runDocgen({ projectRoot: root });
    const original = await Promise.all(outputs.map((file) => readFile(file, "utf8")));
    await markUnchanged(...outputs);
    const orphan = outputPath(root, "orphan");
    await writeSources(root, {
      "src/lib/components/first/props.ts": "export interface FirstProps { value?: number; }",
      "src/lib/components/second/props.ts": "export interface SecondProps {",
      "src/lib/components/orphan/docs.ts": `${GENERATED_HEADER}\nkeep until commit`,
    });
    await expect(runDocgen({ projectRoot: root })).rejects.toThrow();
    expect(await Promise.all(outputs.map((file) => readFile(file, "utf8")))).toEqual(original);
    expect(await Promise.all(outputs.map(async (file) => (await stat(file)).mtimeMs))).toEqual(
      outputs.map(() => PREVIOUS_TIME.getTime())
    );
    expect(await readFile(orphan, "utf8")).toBe(`${GENERATED_HEADER}\nkeep until commit`);

    await writeSources(root, {
      "src/lib/components/second/props.ts": "export interface SecondProps {}",
    });
    await runDocgen({ projectRoot: root });
    expect(await readFile(outputs[0], "utf8")).not.toBe(original[0]);
    await expect(stat(orphan)).rejects.toMatchObject({ code: "ENOENT" });
  }, 60_000);
});
